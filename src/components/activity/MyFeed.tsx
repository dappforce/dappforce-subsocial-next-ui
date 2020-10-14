import React, { useCallback } from 'react';
import { hexToBn } from '@polkadot/util';
import { useMyAddress } from '../auth/MyAccountContext';
import NotAuthorized from '../auth/NotAuthorized';
import { getNewsFeed } from '../utils/OffchainUtils';
import { HeadMeta } from '../utils/HeadMeta';
import { InfiniteList } from '../lists/InfiniteList';
import PostPreview from '../posts/view-post/PostPreview';
import { PostWithAllDetails } from '@subsocial/types';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { Loading } from '../utils';
import { SubsocialApi } from '@subsocial/api/subsocial';
import { ParsedPaginationQuery } from '../utils/getIds';

const title = 'My feed'
const loadingLabel = 'Loading your feed...'

type MyFeedProps = {
  withTitle?: boolean
}

type LoadMoreProps = ParsedPaginationQuery & {
  subsocial: SubsocialApi
  myAddress?: string
}

const loadMore = async (props: LoadMoreProps) => {
  const { subsocial, myAddress, page, size } = props
  
  if (!myAddress) return []

  const offset = (page - 1) * size
  const activity = await getNewsFeed(myAddress, offset, size)
  const postIds = activity.map(x => hexToBn(x.post_id))

  return subsocial.findPublicPostsWithAllDetails(postIds)
}

export const InnerMyFeed = ({ withTitle }: MyFeedProps) => {
  const myAddress = useMyAddress()
  const { subsocial, isApiReady } = useSubsocialApi()

  const Feed = useCallback(() => <InfiniteList
    loadingLabel={loadingLabel}
    title={withTitle ? title : undefined}
    noDataDesc='Your feed is empty. Try to follow more spaces ;)'
    renderItem={(x: PostWithAllDetails) => <PostPreview key={x.post.struct.id.toString()} postDetails={x} withActions />}
    loadMore={(page, size) => loadMore({ subsocial, myAddress, page, size })}
  />, [ myAddress, isApiReady ])

  if (!isApiReady) return <Loading label={loadingLabel} />

  if (!myAddress) return <NotAuthorized />

  return <Feed />
}

export const MyFeed = (props: MyFeedProps) => {
  return <>
    <HeadMeta title={title} />
    <InnerMyFeed {...props}/>
  </>
}

export default MyFeed
