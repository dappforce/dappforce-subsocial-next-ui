import { SpaceContent, SpaceWithSomeDetails } from 'src/types'
import { nonEmptyStr, isEmptyStr } from '@subsocial/utils'
import dynamic from 'next/dynamic'
import Error from 'next/error'
import React from 'react'
import { Segment } from 'src/components/utils/Segment'
import { SummarizeMd } from '../utils/md'
import MyEntityLabel from '../utils/MyEntityLabel'
import Section from '../utils/Section'
import ViewTags from '../utils/ViewTags'
import SpaceStatsRow from './SpaceStatsRow'
import { ViewSpaceProps } from './ViewSpaceProps'
import AboutSpaceLink from './AboutSpaceLink'
import ViewSpaceLink from './ViewSpaceLink'
import { DropdownMenu, HiddenSpaceAlert, SpaceAvatar, isMySpace, isUnlistedSpace, PostPreviewsOnSpace } from './helpers'
import { ContactInfo } from './SocialLinks/ViewSocialLinks'
import { MutedSpan } from '../utils/MutedText'
import { BareProps } from '../utils/types'
import { editSpaceUrl } from '../urls'
import ButtonLink from '../utils/ButtonLink'
import { EditOutlined } from '@ant-design/icons'
import { EntityStatusGroup, PendingSpaceOwnershipPanel } from '../utils/EntityStatusPanels'
import { useAppSelector } from 'src/rtk/app/store'
import { selectSpace } from 'src/rtk/features/spaces/spacesSlice'
import { shallowEqual } from 'react-redux'

const FollowSpaceButton = dynamic(() => import('../utils/FollowSpaceButton'), { ssr: false })

type Props = ViewSpaceProps

const renderSpaceName = (space: SpaceWithSomeDetails) => {
  const name = space?.content?.name
  return isEmptyStr(name)
    ? <MutedSpan>{'<Unnamed Space>'}</MutedSpan>
    : name
}

type SpaceNameAsLinkProps = BareProps & {
  space: SpaceWithSomeDetails
}

export const SpaceNameAsLink = React.memo(({ space, ...props }: SpaceNameAsLinkProps) => {
  const spaceName = renderSpaceName(space)
  return <ViewSpaceLink space={space.struct} title={spaceName} {...props} />
})

export const ViewSpace = (props: Props) => {
  if (props.statusCode === 404) {
    return <Error statusCode={props.statusCode} />
  }

  const { spaceData: initialSpaceData } = props

  if (isUnlistedSpace(initialSpaceData)) {
    return null
  }

  const spaceData = useAppSelector(state =>
    selectSpace(state, { id: initialSpaceData!.id }),
    shallowEqual
  ) || initialSpaceData

  const {
    preview = false,
    nameOnly = false,
    withLink = false,
    miniPreview = false,
    withFollowButton = true,
    withStats = true,
    withTags = true,
    dropdownPreview = false,

    postIds = [],
    posts = [],
    imageSize = 64,
    
    onClick,
  } = props

  const { struct: space, content = {} as SpaceContent } = spaceData
  const { ownerId: owner } = space

  const { about, image, tags, email, links } = content
  const contactInfo = { email, links }
  const spaceName = renderSpaceName(spaceData)

  const Avatar = () => <SpaceAvatar space={space} address={owner} avatar={image} size={imageSize} />

  const isMy = isMySpace(space)

  const primaryClass = `ProfileDetails ${isMy && 'MySpace'}`

  const renderNameOnly = () =>
    withLink
      ? <SpaceNameAsLink space={spaceData} />
      : <span>{spaceName}</span>

  const renderDropDownPreview = () =>
    <div className={`${primaryClass} DfPreview`}>
      <Avatar />
      <div className='content'>
        <div className='handle'>{spaceName}</div>
      </div>
    </div>

  const renderMiniPreview = () =>
    <div className={'viewspace-minipreview'}>
      <div onClick={onClick} className={primaryClass}>
        <Avatar />
        <div className='content'>
          <div className='handle'>{spaceName}</div>
        </div>
      </div>
      {withFollowButton && <FollowSpaceButton space={space} />}
    </div>

  const title = React.createElement(
    preview ? 'span' : 'h1',
    { className: 'header'},
    <>
      <SpaceNameAsLink className='mr-3' space={spaceData} />
      <MyEntityLabel isMy={isMy}>My space</MyEntityLabel>
    </>
  )

  const renderPreview = () =>
    <div className={primaryClass}>
      <div className='DfSpaceBody'>
        <Avatar />
        <div className='ml-2 w-100'>
          <div className='d-flex justify-content-between'>
            {title}
            <span className='d-flex align-items-center'>
              <DropdownMenu className='mx-2' spaceData={spaceData} />
              {isMy &&
                <ButtonLink href={'/[spaceId]/edit'} as={editSpaceUrl(space)} className='mr-2 bg-transparent'>
                  <EditOutlined /> Edit
                </ButtonLink>
              }
              {withFollowButton && <FollowSpaceButton space={space} />}
            </span>
          </div>

          {nonEmptyStr(about) &&
            <div className='description mt-3'>
              <SummarizeMd content={content} more={
                <AboutSpaceLink space={space} title={'Learn More'} />
              } />
            </div>
          }

          {withTags && <ViewTags tags={tags} className='mt-2' />}

          {withStats && <span className='d-flex justify-content-between flex-wrap mt-3'>
            <SpaceStatsRow space={space} />
            {!preview && <ContactInfo {...contactInfo} />}
          </span>}
        </div>
      </div>
    </div>

  if (nameOnly) {
    return renderNameOnly()
  } else if (dropdownPreview) {
    return renderDropDownPreview()
  } else if (miniPreview) {
    return renderMiniPreview()
  } else if (preview) {
    return <Segment>
      <EntityStatusGroup>
        <PendingSpaceOwnershipPanel space={space} preview />
        <HiddenSpaceAlert space={space} preview />
      </EntityStatusGroup>
      {renderPreview()}
    </Segment>
  }

  return <Section>
    <PendingSpaceOwnershipPanel space={space} />
    <HiddenSpaceAlert space={space} />
    <Section>{renderPreview()}</Section>
    <Section className='DfContentPage mt-4'>
      <PostPreviewsOnSpace spaceData={spaceData} posts={posts} postIds={postIds} /> 
    </Section>
  </Section>
}
