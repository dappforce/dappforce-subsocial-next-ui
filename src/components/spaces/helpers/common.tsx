import { isHidden } from '@subsocial/api/utils/visibility-filter'
import { Space } from '@subsocial/types/substrate/interfaces'
import { isDef } from '@subsocial/utils'
import React from 'react'
import { isMyAddress } from 'src/components/auth/MyAccountContext'
import { newPostUrl } from 'src/components/urls'
import NoData from 'src/components/utils/EmptyList'
import HiddenAlert, { BaseHiddenAlertProps } from 'src/components/utils/HiddenAlert'

export type SpaceProps = {
  space: Space
}

export const isHiddenSpace = (space: Space) =>
  isHidden(space)

export const isMySpace = (space?: Space) =>
  isDef(space) && isMyAddress(space.owner)

export const createNewPostLinkProps = (space: Space) => ({
  href: `/[spaceId]/posts/new`,
  as: newPostUrl(space)
})

type HiddenSpaceAlertProps = BaseHiddenAlertProps & {
  space: Space
}

export const HiddenSpaceAlert = (props: HiddenSpaceAlertProps) =>
  <HiddenAlert struct={props.space} type='space' {...props} />

export const SpaceNotFound = () =>
  <NoData description={'Space not found'} />
