import React, { useState } from 'react';
import { DfMd } from '../utils/DfMd';
import Link from 'next/link';

import { AccountId } from '@polkadot/types/interfaces';
import IdentityIcon from '@polkadot/react-identicon';
import { ZERO } from '../utils/index';
import { HeadMeta } from '../utils/HeadMeta';
import { nonEmptyStr, isEmptyStr } from '@subsocial/utils'
import { AccountFollowersModal, AccountFollowingModal } from './AccountsListModal';
// import { ProfileHistoryModal } from '../utils/ListsEditHistory';
import dynamic from 'next/dynamic';
import { MutedDiv } from '../utils/MutedText';
import { isMyAddress } from '../auth/MyAccountContext';
import Section from '../utils/Section';
import { DfBgImg } from '../utils/DfBgImg';
import { Pluralize } from '../utils/Plularize';

import { Menu, Dropdown, Icon } from 'antd';
import { NextPage } from 'next';
import BN from 'bn.js';
import isEmpty from 'lodash.isempty';
import { Profile } from '@subsocial/types/substrate/interfaces';
import { ProfileContent } from '@subsocial/types/offchain';
import { getSubsocialApi } from '../utils/SubsocialConnect';
import { ProfileData } from '@subsocial/types';
import { withLoadedOwner } from './address-views/utils/withLoadedOwner';
import { InfoDetails } from './address-views';
import { useSubsocialApi } from '../utils/SubsocialApiContext';
import { getAccountId } from '../utils/substrate';
import MyEntityLabel from '../utils/MyEntityLabel';
import { SummarizeMd } from '../utils/md';
import ViewProfileLink from './ViewProfileLink';
import { LARGE_AVATAR_SIZE } from 'src/config/Size.config';

const FollowAccountButton = dynamic(() => import('../utils/FollowAccountButton'), { ssr: false });

export type Props = {
  preview?: boolean,
  nameOnly?: boolean,
  withLink?: boolean,
  id: AccountId,
  owner?: ProfileData,
  followers?: AccountId[],
  size?: number
};

const Component: NextPage<Props> = (props: Props) => {
  const {
    id,
    preview = false,
    nameOnly = false,
    withLink = false,
    size = LARGE_AVATAR_SIZE,
    owner = {} as ProfileData
  } = props;

  const [ followersOpen, setFollowersOpen ] = useState(false);
  const [ followingOpen, setFollowingOpen ] = useState(false);
  const { isApiReady } = useSubsocialApi()

  const address = id.toString();
  const isMyAccount = isMyAddress(address);

  const {
    struct,
    content = {} as ProfileContent,
    profile = {} as Profile
  } = owner;

  const noProfile = isEmpty(profile);
  const followers = struct ? new BN(struct.followers_count) : ZERO;
  const following = struct ? new BN(struct.following_accounts_count) : ZERO;
  const reputation = struct ? new BN(struct.reputation) : ZERO;

  const {
    username
  } = profile;

  const {
    fullname,
    avatar,
    email,
    personalSite,
    about,
    facebook,
    twitter,
    linkedIn,
    medium,
    github,
    instagram
  } = content;

  // TODO fix copypasta of social links. Implement via array.
  const hasEmail = email && nonEmptyStr(email);
  const hasPersonalSite = personalSite && nonEmptyStr(personalSite);
  const hasAvatar = avatar && nonEmptyStr(avatar);
  const hasFacebookLink = facebook && nonEmptyStr(facebook);
  const hasTwitterLink = twitter && nonEmptyStr(twitter);
  const hasLinkedInLink = linkedIn && nonEmptyStr(linkedIn);
  const hasMediumLink = medium && nonEmptyStr(medium);
  const hasGitHubLink = github && nonEmptyStr(github);
  const hasInstagramLink = instagram && nonEmptyStr(instagram);

  const createProfileButton = noProfile && isMyAccount &&
    <Link href={`/profile/new`}>
      <a className='DfCreateProfileButton'>
        <i className='plus icon' />
        Create profile
      </a>
    </Link>;

  const renderDropDownMenu = () => {
    if (noProfile) return null;

    const menu = (
      <Menu>
        {isMyAccount && <Menu.Item key='0'>
          <Link href={`/profile/edit`} ><a className='item'>Edit</a></Link>
        </Menu.Item>}
        {/* {edit_history.length > 0 && <Menu.Item key='1'>
          <div onClick={() => setOpen(true)} >View edit history</div>
        </Menu.Item>} */}
      </Menu>
    );

    return <>
      {isMyAccount &&
        <Dropdown overlay={menu} placement='bottomRight'>
          <Icon type='ellipsis' />
        </Dropdown>
      }
      {/* open && <ProfileHistoryModal id={id} open={open} close={close} /> */}
    </>
  };

  const isOnlyAddress = isEmptyStr(fullname) || isEmptyStr(username);

  // TODO extract function: there is similar code in other files
  const getName = () => {
    if (isOnlyAddress) {
      return address;
    } else {
      return fullname;
    }
  };

  const accountForUrl = { address, username }

  const renderDescription = () => preview
    ? <SummarizeMd md={about} more={<ViewProfileLink account={accountForUrl} title={'See More'} />} />
    : <DfMd className='mt-3' source={about} />

  const NameAsLink = () =>
    <ViewProfileLink account={accountForUrl} title={getName()} className='handle DfBoldBlackLink' />

  const renderNameOnly = () => {
    return withLink
      ? <NameAsLink />
      : <>{getName()}</>;
  };

  const renderPreview = () => {
    return <div>
      <div className={`ProfileDetails MySpace`}>
        {hasAvatar
          ? <DfBgImg size={size} src={avatar} className='DfAvatar space' rounded/>
          : <IdentityIcon className='image' value={address} size={size} />
        }
        <div className='content'>
          <div className='header DfProfileTitle'>
            <NameAsLink />
            <MyEntityLabel isMy={isMyAccount}>Me</MyEntityLabel>
            {renderDropDownMenu()}
          </div>
          {!isOnlyAddress && <MutedDiv>Address: {address}</MutedDiv>}
          <div className='about'>
            <div>
              {isApiReady && <InfoDetails address={address} details={<>Reputation: {reputation.toString()}</>}/>}
              <div className='DfSocialLinks'>
                {hasEmail &&
                  <a target='_blank' href={`mailto:${email}`}>
                    <Icon type='mail' />
                  </a>
                }

                {/* TODO fix copypasta of social links. Implement via array. */}

                {hasPersonalSite &&
                  <a
                    href={personalSite}
                    target='_blank'
                  >
                    <Icon type='global' />
                  </a>
                }
                {hasFacebookLink &&
                  <a target='_blank' href={facebook}>
                    <Icon type='facebook' />
                  </a>
                }
                {hasTwitterLink &&
                  <a target='_blank' href={twitter}>
                    <Icon type='twitter' />
                  </a>}
                {hasMediumLink &&
                  <a target='_blank' href={linkedIn}>
                    <Icon type='medium' />
                  </a>
                }
                {hasLinkedInLink &&
                  <a target='_blank' href={linkedIn}>
                    <Icon type='linkedin' />
                  </a>
                }
                {hasMediumLink &&
                  <a target='_blank' href={linkedIn}>
                    <Icon type='medium' />
                  </a>
                }
                {hasGitHubLink &&
                  <a target='_blank' href={github}>
                    <Icon type='github' />
                  </a>
                }
                {hasInstagramLink &&
                  <a target='_blank' href={instagram}>
                    <Icon type='instagram' />
                  </a>
                }
              </div>
            </div>
            {renderDescription()}
          </div>
        </div>
      </div>
    </div>;
  };

  if (nameOnly) {
    return renderNameOnly();
  } else if (preview) {
    return renderPreview();
  }

  const noFollowers = followers.eq(ZERO);
  const noFollowing = following.eq(ZERO);

  return <>
    <HeadMeta title={getName()} desc={about} image={avatar} />
    <Section>
      <div className='FullProfile'>
        {renderPreview()}
        <div className='Profile--actions'>
          <span onClick={() => noFollowers && setFollowersOpen(true)} className={`${noFollowers && 'disable'} DfProfileModalLink`}><Pluralize count={followers.toString()} singularText='Follower'/></span>
          <span onClick={() => noFollowing && setFollowingOpen(true)} className={`${noFollowing && 'disable'} DfProfileModalLink`}>{following.toString()} Following </span>
          <div className='mt-3'>
            {createProfileButton}
            <FollowAccountButton address={address} />
          </div>
        </div>
      </div>
      {followersOpen && <AccountFollowersModal id={id} accountsCount={followers.toString()} open={followersOpen} close={() => setFollowersOpen(false)} title={<Pluralize count={followers.toString()} singularText='Follower'/>} />}
      {followingOpen && <AccountFollowingModal id={id} accountsCount={following.toString()} open={followingOpen} close={() => setFollowingOpen(false)} title={'Following'} />}
    </Section>
  </>;
};

Component.getInitialProps = async (props): Promise<any> => {
  const { query: { address }, res } = props;
  const subsocial = await getSubsocialApi()
  const accountId = await getAccountId(address as string);

  // TODO resolve profile by accountId or handle (username)

  if (!accountId && res) {
    res.statusCode = 404
    return { statusCode: 404 }
  }

  const owner = await subsocial.findProfile(address as string)
  return {
    id: accountId,
    owner
  };
};

export default Component;

export const ViewProfile = withLoadedOwner(Component)
