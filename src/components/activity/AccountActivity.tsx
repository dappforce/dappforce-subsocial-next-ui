import React, { useState, useEffect } from 'react'
import { getActivities, getReactionActivities, getCommentActivities, getPostActivities, getFollowActivities, getActivityCounts } from '../utils/OffchainUtils'
import { Tabs } from 'antd'
import { OwnedSpacesList, LoadSpacesType } from '../spaces/AccountSpaces'
import { Counts } from '@subsocial/types'
import { getLoadMoreActivitiesFn, NotifActivities } from './Notifications'
import { BaseActivityProps } from './types'
import { getLoadMoreFeedFn, FeedActivities } from './FeedActivities'
import { Loading } from '../utils'
import { uiShowActivity } from '../utils/env'

const { TabPane } = Tabs

type ActivitiesByAddressProps = Partial<LoadSpacesType> & {
  address: string
}

const loadMoreActivities = getLoadMoreActivitiesFn(getActivities)

const AllActivities = (props: BaseActivityProps) => <NotifActivities
  {...props}
  type='activities'
  loadMore={loadMoreActivities}
  noDataDesc='No activities yet'
  loadingLabel='Loading activities...'
/>

const loadMoreReactions = getLoadMoreActivitiesFn(getReactionActivities)

const ReactionActivities = (props: BaseActivityProps) => <NotifActivities
  {...props}
  type='activities'
  loadMore={loadMoreReactions}
  noDataDesc='No reactions yet'
  loadingLabel='Loading reactions...'
/>

const loadMoreFollows = getLoadMoreActivitiesFn(getFollowActivities)

const FollowActivities = (props: BaseActivityProps) => <NotifActivities
  {...props}
  type='activities'
  loadMore={loadMoreFollows}
  noDataDesc='No follows yet'
  loadingLabel='Loading follows...'
/>

const loadMoreComment = getLoadMoreFeedFn(getCommentActivities, 'comment_id')

const CommentActivities = (props: BaseActivityProps) => <FeedActivities
  {...props}
  loadMore={loadMoreComment}
  noDataDesc='No comments yet'
  loadingLabel='Loading comments...'
/>

const loadMorePost = getLoadMoreFeedFn(getPostActivities, 'post_id')

const PostActivities = (props: BaseActivityProps) => <FeedActivities
  {...props}
  loadMore={loadMorePost}
  noDataDesc='No posts yet'
  loadingLabel='Loading posts...'
/>

export const AccountActivity = ({ address, spaceIds: mySpaceIds }: ActivitiesByAddressProps) => {
  if (!uiShowActivity) return null

  const [ counts, setCounts ] = useState<Counts>()

  useEffect(() => {
    if (!address) return

    getActivityCounts(address.toString()).then(setCounts)
  }, [ address ])

  if (!counts) return <Loading label='Loading activities...' />

  const { postsCount, commentsCount, reactionsCount, followsCount, activitiesCount } = counts

  const spacesCount = mySpaceIds?.length || 0

  const getTabTitle = (title: string, count: number) => `${title} (${count})`

  return <Tabs>
    <TabPane tab={getTabTitle('Posts', postsCount)} key='posts'>
      <PostActivities address={address} totalCount={postsCount} />
    </TabPane>
    <TabPane tab={getTabTitle('Comments', commentsCount)} key='comments'>
      <CommentActivities address={address} totalCount={commentsCount} />
    </TabPane>
    <TabPane tab={getTabTitle('Reactions', reactionsCount)} key='reactions'>
      <ReactionActivities address={address} totalCount={reactionsCount} />
    </TabPane>
    <TabPane tab={getTabTitle('Follows', followsCount)} key='follows'>
      <FollowActivities address={address} totalCount={followsCount} />
    </TabPane>
    <TabPane tab={getTabTitle('Spaces', spacesCount)} key='spaces'>
      <OwnedSpacesList address={address} withTitle={false} />
    </TabPane>
    <TabPane tab={getTabTitle('All', activitiesCount)} key='all'>
      <AllActivities address={address} totalCount={activitiesCount} />
    </TabPane>
  </Tabs>
}


