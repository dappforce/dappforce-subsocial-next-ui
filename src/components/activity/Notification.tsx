import React, { useEffect, useState } from 'react';
import { DfBgImg } from '../utils/DfBgImg';
import { nonEmptyStr } from '@subsocial/utils';
import Avatar from '../profiles/address-views/Avatar'
import { ProfileData, PostData, CommentData, BlogData, AnySubsocialData, CommonStruct, Activity } from '@subsocial/types';
import Name from '../profiles/address-views/Name';
import { MutedDiv } from '../utils/MutedText';
import BN from 'bn.js'
import { hexToBn } from '@polkadot/util';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { Loading } from '../utils/utils';
import { SocialAccount } from '@subsocial/types/substrate/interfaces';
import { NotificationType, getNotification, ActivityStore } from './NotificationUtils';

type Struct = Exclude<CommonStruct, SocialAccount>;

type LoadProps = {
  activities: Activity[]
}

type NotificationsProps = {
  notifications: NotificationType[]
}

export function withLoadNotifications<P extends LoadProps> (Component: React.ComponentType<NotificationsProps>) {
  return function (props: P) {
    const { activities } = props;
    const { subsocial } = useSubsocialApi()
    const [ loaded, setLoaded ] = useState(false)
    const [ blogByBlogIdMap, setBlogByBlogIdMap ] = useState(new Map<string, BlogData>())
    const [ postByPostIdMap, setPostByPostIdMap ] = useState(new Map<string, PostData>())
    const [ commentByCommentIdMap, setCommentByCommentIdMap ] = useState(new Map<string, CommentData>())
    const [ ownerDataByOwnerIdMap, setOwnerDataByOwnerIdMap ] = useState(new Map<string, ProfileData>())

    useEffect(() => {
      setLoaded(false);

      const ownerIds: string[] = []
      const blogIds: BN[] = []
      const postIds: BN[] = []
      const commentIds: BN[] = []

      activities.forEach(({ account, blog_id, post_id, comment_id }) => {
        nonEmptyStr(account) && ownerIds.push(account)
        nonEmptyStr(blog_id) && blogIds.push(hexToBn(blog_id))
        nonEmptyStr(post_id) && postIds.push(hexToBn(post_id))
        nonEmptyStr(comment_id) && commentIds.push(hexToBn(comment_id))
      })

      const loadData = async () => {
        const ownersData = await subsocial.findProfiles(ownerIds);
        const blogsData = await subsocial.findBlogs(blogIds)
        const postsData = await subsocial.findPosts(postIds)
        const commentsData = await subsocial.findComments(commentIds)

        function createMap<T extends AnySubsocialData> (data: T[], owners: boolean = false) {
          const dataByIdMap = new Map<string, T>()
          data.forEach(x => {
            const id = owners ? (x as ProfileData).profile?.created.account : (x.struct as Struct).id;
            if (id) {
              dataByIdMap.set(id.toString(), x);
            }
          })
          return dataByIdMap;
        }
        setOwnerDataByOwnerIdMap(createMap<ProfileData>(ownersData, true))
        setBlogByBlogIdMap(createMap<BlogData>(blogsData))
        setPostByPostIdMap(createMap<PostData>(postsData))
        setCommentByCommentIdMap(createMap<CommentData>(commentsData))
        setLoaded(true);
      }

      loadData().catch(err => new Error(err))

    }, [ false ])

    const activityStore: ActivityStore = {
      blogByBlogIdMap,
      postByPostIdMap,
      commentByCommentIdMap,
      ownerDataByOwnerIdMap
    }

    if (loaded) {
      const notifications = activities.map(x => getNotification(x, activityStore)).filter(x => x !== undefined) as NotificationType[]
      return <Component notifications={notifications} />
    } else {
      return <Loading />
    }
  }
}

export const NotificationsView: React.FunctionComponent<NotificationsProps> = ({ notifications }) =>
  <>{notifications.map((x, i) => <Notification key={i} {...x} />)}</>

export const Notifications = withLoadNotifications(NotificationsView);

export function Notification (props: NotificationType) {
  const { address, notificationMessage, details, image = '', owner } = props;
  const avatar = owner?.content?.avatar;
  return <div className='DfNotificationItem'>
    <Avatar address={address} avatar={avatar} size={30}/>
    <div className="DfNotificationContent">
      <div className="DfTextActivity">
        <Name owner={owner} address={address}/>
        {notificationMessage}
      </div>
      <MutedDiv className='DfDate'>{details}</MutedDiv>
    </div>
    {nonEmptyStr(image) && <DfBgImg width={80} height={60} src={image}/>}
  </div>;
}

export default Notification
