import React from 'react';
import { DfBgImageLink } from '../utils/DfBgImg';
import { nonEmptyStr } from '@subsocial/utils';
import Avatar from '../profiles/address-views/Avatar'
import { ProfileData, AnySubsocialData, CommonStruct, Activity } from '@subsocial/types';
import Name from '../profiles/address-views/Name';
import { MutedDiv } from '../utils/MutedText';
import BN from 'bn.js'
import { hexToBn } from '@polkadot/util';
import { SocialAccount, Post } from '@subsocial/types/substrate/interfaces';
import { NotificationType, getNotification, ActivityStore } from './NotificationUtils';
import { SubsocialApi } from '@subsocial/api/subsocial';
import { NotifActivitiesType } from './Notifications';
import Link from 'next/link';
type Struct = Exclude<CommonStruct, SocialAccount>

const fillArray = <T extends string | BN>(
  id: T,
  structIds: T[],
  structByIdMap: Map<string, AnySubsocialData>
) => {
  const struct = structByIdMap.get(id.toString())

  if (!struct) {
    structIds.push(id)
  }
}

export const loadNotifications = async (
    subsocial: SubsocialApi,
    activities: Activity[],
    activityStore: ActivityStore,
    type: NotifActivitiesType
) => {
  const { spaceById, postById, ownerById } = activityStore

  const ownerIds: string[] = []
  const spaceIds: BN[] = []
  const postIds: BN[] = []

  activities.forEach(({ account, space_id, post_id, comment_id }) => {
    nonEmptyStr(account) && fillArray(account, ownerIds, ownerById)
    nonEmptyStr(space_id) && fillArray(hexToBn(space_id), spaceIds, spaceById)
    nonEmptyStr(post_id) && fillArray(hexToBn(post_id), postIds, postById)
    nonEmptyStr(comment_id) && fillArray(hexToBn(comment_id), postIds, postById)
  })

  const ownersData = await subsocial.findProfiles(ownerIds)
  const postsData = await subsocial.findPublicPosts(postIds)

  function fillMap<T extends AnySubsocialData> (
    data: T[],
    structByIdMap: Map<string, AnySubsocialData>,
    structName?: 'profile' | 'post'
  ) {
    data.forEach(x => {
      let id

      switch (structName) {
        case 'profile': {
          id = (x as ProfileData).profile?.created.account
          break
        }
        case 'post': {
          const struct = (x.struct as Post)
          id = struct.id
          const spaceId = struct.space_id.unwrapOr(undefined)
          spaceId && spaceIds.push(spaceId)
          break
        }
        default: {
          id = (x.struct as Struct).id
        }
      }

      if (id) {
        structByIdMap.set(id.toString(), x)
      }
    })
  }

  fillMap(postsData, postById, 'post'),
  fillMap(ownersData, ownerById, 'profile')

  // Only at this point we have ids of spaces that should be loaded:
  const spacesData = await subsocial.findPublicSpaces(spaceIds)
  fillMap(spacesData, spaceById)

  return activities
    .map(x => getNotification(x, activityStore, type))
    .filter(x => x !== undefined) as NotificationType[]
}

export function Notification (props: NotificationType) {
  const { address, notificationMessage, details, image = '', owner, links } = props
  const avatar = owner?.content?.avatar

  return <Link {...links}>
    <a className='DfNotificationItem'>
      <Avatar address={address} avatar={avatar} />
      <div className='d-flex justify-content-between w-100'>
        <div className="DfNotificationContent">
          <div className="d-flex">
            <Name owner={owner} address={address}/>
            {notificationMessage}
          </div>
          <MutedDiv className='DfDate'>{details}</MutedDiv>
        </div>
        {nonEmptyStr(image) && <DfBgImageLink {...links} className='mb-1' src={image} size={80} />}
      </div>
    </a>
  </Link>
}

export default Notification
