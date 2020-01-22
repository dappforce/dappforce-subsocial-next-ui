import React from 'react';

import { BlogId, Blog } from '../types';
import { ViewBlogPage, loadBlogData, BlogData } from './ViewBlog';
import { GenericAccountId as AccountId } from '@polkadot/types';
import ListData from '../utils/DataList';
import { Button } from 'antd';
import BN from 'bn.js';
import Router, { useRouter } from 'next/router';
import { Pluralize } from '../utils/Plularize';
import { useSidebarCollapsed } from '../utils/SideBarCollapsedContext';
import { isMobile } from 'react-device-detect';
import { NextPage } from 'next';
import { SeoHeads } from '../utils';
import { getApi } from '../utils/utils';

type ListBlogPageProps = {
  blogsData: BlogData[]
};

export const ListFollowingBlogsPage: NextPage<ListBlogPageProps> = (props: ListBlogPageProps) => {
  const { blogsData } = props;
  const totalCount = blogsData !== undefined ? blogsData && blogsData.length : 0;

  return (<div className='ui huge relaxed middle aligned divided list ProfilePreviews'>
      <SeoHeads title='My followed' name='My blogs' desc='Subsocial blogs' />
      <ListData
        title={<Pluralize count={totalCount} singularText='Following blog'/>}
        dataSource={blogsData}
        renderItem={(item,index) => (
            <ViewBlogPage {...props} key={index} blogData={item} previewDetails withFollowButton/>
        )}
        noDataDesc='You are not subscribed to any blog'
        noDataExt={<Button href='/blog/all'>Show all blogs</Button>}
      />
    </div>
  );
};

ListFollowingBlogsPage.getInitialProps = async (props): Promise<any> => {
  const { query: { address } } = props;
  console.log(props);
  const api = await getApi();
  const followedBlogsData = await api.query.blogs.blogsFollowedByAccount(new AccountId(address as string)) as unknown as BlogId[];
  const loadBlogs = followedBlogsData.map(id => loadBlogData(api, id));
  const blogsData = await Promise.all<BlogData>(loadBlogs);
  console.log(blogsData);
  return {
    blogsData
  };
};

// const ListFollowingBlogs = () => {
//   const { state: { address: myAddress } } = useMyAccount();
//   const [ followedBlogsData, setFollowedBlogsData ] = useState([] as BlogData[]);

//   useEffect(() => {
//     let isSubscribe = true;
//     const loadBlogsData = async () => {
//       const ids = await api.query.blogs.blogsFollowedByAccount(myAddress) as unknown as BlogId[];
//       const loadBlogs = ids.map(id => loadBlogData(api,id));
//       const blogsData = await Promise.all<BlogData>(loadBlogs);
//       isSubscribe && setFollowedBlogsData(blogsData);
//     };

//     loadBlogsData().catch(console.log);

//     return () => { isSubscribe = false; };
//   }, [ followedBlogsData.length > 0 ]);

//   return
// };

type Props = {
  followedBlogsData: BlogData[]
};

export const RenderFollowedList = (props: Props) => {
  const { followedBlogsData } = props;
  const totalCount = followedBlogsData !== undefined ? followedBlogsData && followedBlogsData.length : 0;
  const router = useRouter();
  const { pathname, query } = router;
  const currentBlog = pathname.includes('blog') ? new BN(query.blogId as string) : undefined;
  const { toggle } = useSidebarCollapsed();

  return <>{totalCount > 0
    ? followedBlogsData.map((item, index) =>
      <div key={index} className={currentBlog && item.blog && currentBlog.eq(item.blog.id) ? 'DfSelectedBlog' : ''} >
        <ViewBlogPage
          key={index}
          blogData={item}
          onClick={() => {
            isMobile && toggle();
            console.log('Toggle');
            Router.push('/blog/[blogId]', `/blog/${(item.blog as Blog).id}`).catch(console.log);
          }}
          miniPreview
          imageSize={28}
        />
      </div>)
    : <div className='DfNoFollowed'><Button type='primary' size='small' href='/blog/all'>Show all</Button></div>}
  </>;
};

export default RenderFollowedList;
