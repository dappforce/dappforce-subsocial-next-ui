import { Comment as SuiComment } from 'semantic-ui-react';
import React, { useState, useEffect } from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import Section from '../utils/Section';
import { useMyAccount } from '../utils/MyAccountContext';
import { ApiProps } from '@polkadot/ui-api/types';
import { api } from '@polkadot/ui-api';
import { Option } from '@polkadot/types';
import moment from 'moment-timezone';
import mdToText from 'markdown-to-txt';

import { getJsonFromIpfs } from '../utils/OffchainUtils';
import { partition, isEmpty } from 'lodash';
import { PostId, CommentId, Comment, OptionComment, CommentContent, PostContent, Post } from '../types';
import { NewComment } from './EditComment';
import { queryBlogsToProp } from '../utils/index';
import { HeadMeta } from '../utils/HeadMeta';
import { Voter } from '../voting/Voter';
import { CommentHistoryModal } from '../utils/ListsEditHistory';
import ReactMarkdown from 'react-markdown';
import { MutedDiv } from '../utils/MutedText';
import Link from 'next/link';
import { Pluralize, pluralize } from '../utils/Plularize';
import { Loading, getApi, formatUnixDate } from '../utils/utils';
import { Icon, Menu, Dropdown } from 'antd';
import { NextPage } from 'next';
import { loadPostData, PostData } from './ViewPost';
import dynamic from 'next/dynamic';
const AddressComponents = dynamic(() => import('../utils/AddressComponents'), { ssr: false });

type Props = ApiProps & {
  postId: PostId;
  commentIds?: CommentId[];
  commentIdForPage?: CommentId;
};

const renderLevelOfComments = (parentComments: Comment[], childrenComments: Comment[]) => {
  return parentComments.map((comment, i) =>
    <ViewComment key={i} comment={comment} commentsWithParentId={childrenComments} />);
};

export function CommentsTree (props: Props) {
  const {
    postId,
    commentIds = [],
    commentIdForPage
  } = props;

  const commentsCount = commentIds.length;// post.comments_count.toNumber();
  const [ loaded, setLoaded ] = useState(false);
  const [ comments, setComments ] = useState(new Array<Comment>());

  useEffect(() => {
    let isSubscribe = true;

    const loadComments = async () => {
      if (!commentsCount) return;
      const apiCalls: Promise<OptionComment>[] = commentIds.map(id =>
        api.query.blogs.commentById(id) as Promise<OptionComment>);

      const loadedComments = (await Promise.all<OptionComment>(apiCalls)).map(x => x.unwrap() as Comment);

      if (isSubscribe) {
        setComments(loadedComments);
        setLoaded(true);
      }
    };

    loadComments().catch(err => console.log(err));

    return () => { isSubscribe = false; };
  }, [ commentsCount ]);// TODO change dependense on post.comments_counts or CommentCreated, CommentUpdated with current postId

  const isPage = !!commentIdForPage;

  const renderComments = () => {
    if (!commentsCount) {
      return <></>;
    }

    if (!loaded) {
      return <div style={{ marginTop: '1rem' }}><Loading /></div>;
    }

    const [ parentComments, childrenComments ] = partition(comments, e => e.parent_id.isNone);
    if (commentIdForPage !== undefined) {
      const [ comment, childrenComments ] = partition(comments, (e) => e.id.eq(commentIdForPage));
      return <ViewComment comment={comment[0]} commentsWithParentId={childrenComments} isPage/>;
    } else {
      return <>{renderLevelOfComments(parentComments, childrenComments)}</>;
    }
  };

  const RenderCommentsOnPost = () => (
    <Section className='DfCommentsByPost'>
      <h4><Pluralize count={commentsCount} singularText='comment' /></h4>
      <div id={`comments-on-post-${postId}`}>
        {<NewComment postId={postId}/>}
        {renderComments()}
      </div>
    </Section>
  );

  const RenderCommentPage = () => (
    <Section>
      {renderComments()}
    </Section>
  );

  return isPage ? <RenderCommentPage/> : <RenderCommentsOnPost/>;
}

export default withMulti(
  CommentsTree,
  withCalls<Props>(
    queryBlogsToProp('commentIdsByPostId', { paramName: 'postId', propName: 'commentIds' })
  )
);

// export function withIdsFromUrl (Component: React.ComponentType<Props>) {
//   return function (props: Props) {
//     const router = useRouter();
//     const { postId, commentId } = router.query;
//     try {
//       return <Component postId={new PostId(postId as string)} commentIdForPage={new CommentId(commentId as string)} {...props}/>;
//     } catch (err) {
//       return <em>Invalid url</em>;
//     }
//   };
// }

// export const CommentPage = withMulti(
//   CommentsTree,
//   withIdsFromUrl,
//   withCalls<Props>(
//     queryBlogsToProp('commentIdsByPostId', { paramName: 'postId', propName: 'commentIds' })
//   )
// );

type ViewCommentProps = {
  comment: Comment;
  commentsWithParentId: Comment[];
  isPage?: boolean;
  post?: Post;
  postContent?: PostContent;
  commentContent?: CommentContent;
};

export const ViewComment: NextPage<ViewCommentProps> = (props: ViewCommentProps) => {
  const {
    comment,
    commentsWithParentId,
    isPage = false,
    post: initialPost = {} as Post,
    postContent: initialPostContent = {} as PostContent,
    commentContent = {} as CommentContent
  } = props;
  const { state: { address: myAddress } } = useMyAccount();
  const [ parentComments, childrenComments ] = partition(commentsWithParentId, (e) => e.parent_id.eq(comment.id));

  const { id, score, created: { account, time }, post_id, edit_history } = comment;
  const [ struct, setStruct ] = useState(comment);
  const [ post, setPost ] = useState(initialPost);
  const [ postContent, setPostContent ] = useState(initialPostContent);
  const [ content, setContent ] = useState(commentContent);
  const [ showEditForm, setShowEditForm ] = useState(false);
  const [ showReplyForm, setShowReplyForm ] = useState(false);
  const [ doReloadComment, setDoReloadComment ] = useState(true);

  // const reactionKind = reactionState ? reactionState.kind.toString() : 'None';
  if (!comment || comment.isEmpty) {
    return null;
  }

  useEffect(() => {
    let isSubscribe = true;

    getJsonFromIpfs<CommentContent>(struct.ipfs_hash).then(json => {
      isSubscribe && setContent(json);
    }).catch(err => console.log(err));

    const loadComment = async () => {
      const result = await api.query.blogs.commentById(id) as OptionComment;
      if (result.isNone) return;
      const comment = result.unwrap() as Comment;
      if (isSubscribe) {
        setStruct(comment);
      }
    };
    loadComment().catch(console.log);

    const loadPostContent = async () => {
      if (isEmpty(post)) {
        const result = await api.query.blogs.postById(post_id) as Option<Post>;
        if (result.isNone) return;
        isSubscribe && setPost(result.unwrap());
      }
      const content = await getJsonFromIpfs<PostContent>(post.ipfs_hash);
      if (isSubscribe) {
        setPostContent(content);
      }
    };
    loadPostContent().catch(console.log);

    return () => { isSubscribe = false; };
  }, [ doReloadComment ]);

  const isMyStruct = myAddress === account.toString();

  const RenderDropDownMenu = () => {
    const [ open, setOpen ] = useState(false);
    const close = () => setOpen(false);
    const showDropdown = isMyStruct || edit_history.length > 0;

    const menu = (
      <Menu>
        {(isMyStruct || showEditForm) && <Menu.Item key='0'>
          <div onClick={() => setShowEditForm(true)} >Edit</div>
        </Menu.Item>}
        {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>}
      </Menu>
    );

    return (<>{showDropdown &&
    <Dropdown overlay={menu} placement='bottomRight'>
      <Icon type='ellipsis' />
    </Dropdown>}
    {open && <CommentHistoryModal id={id} open={open} close={close} />}
    </>);
  };

  const replyButton = () => (
    <span
      onClick={() => setShowReplyForm(true)}
      className='reply'
    >
      Reply
    </span>
  );

  const responseTitle = <>In response to <Link href='/blogs/[blogId]/posts/[postId]' as={`/blogs/${post.blog_id}/posts/${post_id.toString()}`}><a>{postContent.title}</a></Link></>;
  const bodyAsText = mdToText(content.body);

  return <div id={`comment-${id}`} className='DfComment'>
    {isPage && <>
      <HeadMeta desc={bodyAsText} title={`${account} commented on ${postContent.title}`} />
      <MutedDiv style={{ marginTop: '1rem' }}>{responseTitle}</MutedDiv>
    </>}
    <SuiComment.Group threaded>
      <SuiComment>
        <div className='DfCommentContent'>
          <SuiComment.Metadata>
            <AddressComponents
              value={account}
              isShort={true}
              isPadded={false}
              size={32}
              extraDetails={
                <Link href={`/comment?postId=${struct.post_id.toString()}&&commentId=${id.toString()}`}>
                  <a className='DfGreyLink'>
                    {`${moment(formatUnixDate(time)).fromNow()} · ${pluralize(score, 'Point')}`}
                  </a>
                </Link>}
            />
          </SuiComment.Metadata>
          <SuiComment.Content>
            {showEditForm
              ? <NewComment
                struct={struct}
                id={struct.id}
                postId={struct.post_id}
                json={content.body}
                onSuccess={() => { setShowEditForm(false); setDoReloadComment(!doReloadComment); }}
              />
              : <>
                <SuiComment.Text>
                  <ReactMarkdown className='DfMd' source={content.body} linkTarget='_blank' />
                </SuiComment.Text>
                <SuiComment.Actions>
                  {showReplyForm
                    ? <SuiComment.Action>
                      <NewComment
                        postId={struct.post_id}
                        parentId={struct.id}
                        onSuccess={() => setShowReplyForm(false)}
                        autoFocus={true}
                      />
                    </SuiComment.Action>
                    : <>
                      <SuiComment.Action>
                        <Voter struct={struct} type={'Comment'} />
                      </SuiComment.Action>
                      <SuiComment.Action>
                        {replyButton()}
                      </SuiComment.Action>
                      <SuiComment.Action>
                        <RenderDropDownMenu />
                      </SuiComment.Action>
                    </>}
                </SuiComment.Actions>
              </>}
          </SuiComment.Content>
        </div>
        <div className={'ChildComment'}>{renderLevelOfComments(parentComments, childrenComments)}</div>
      </SuiComment>
    </SuiComment.Group>
  </div>;
};

ViewComment.getInitialProps = async (props): Promise<ViewCommentProps> => {
  const { query: { commentId } } = props;
  const api = await getApi();
  const commentOpt = await api.query.blogs.commentById(commentId) as Option<Comment>;
  const comment = commentOpt.unwrapOr({} as Comment);
  const postData = comment && await loadPostData(api, comment.post_id) as PostData;
  const commentContent = comment && await getJsonFromIpfs<CommentContent>(comment.ipfs_hash);
  return {
    comment: comment,
    post: postData.post,
    postContent: postData.initialContent,
    commentsWithParentId: [] as Comment[],
    commentContent,
    isPage: true
  };
};
