import React from 'react'
import { ProfileData } from '@subsocial/types';
import classes from '@polkadot/react-components/util/classes';
import { Popover } from 'antd';
import Avatar from './Avatar';
import ProfilePreview from './ProfilePreview';
import { toShortAddress } from '@polkadot/react-components/util';
import AccountId from '@polkadot/types/generic/AccountId';
import { withLoadedOwner } from './utils/withLoadedOwner';
import { ExtendedAddressProps } from './utils/types';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useApi } from '@polkadot/react-hooks';
const Balance = dynamic(() => import('./utils/DfBalance'), { ssr: false });

export type InfoProps = {
  details?: JSX.Element,
  address?: string | AccountId
}
export const InfoDetails: React.FunctionComponent<InfoProps> = ({ details, address }) => {
  const { isApiReady } = useApi()
  return <>
    <div className='Df--AddressComponents-details'>
      {address && isApiReady && <>
        <Balance address={address.toString()} />
      </>}
      {address && details && ' · '}
      {details}
    </div>
  </>;
}

export const AuthorPreview = (props: ExtendedAddressProps) => {
  const {
    address,
    owner = {} as ProfileData,
    className,
    isPadded = true,
    isShort = true,
    style,
    size,
    children,
    details
  } = props;

  const username = owner.profile?.username;
  const avatar = owner.content?.avatar
  const fullname = owner.content?.fullname

  return <div
    className={classes('ui--AddressComponents', isPadded ? 'padded' : '', className)}
    style={style}
  >
    <div className='ui--AddressComponents-info'>
      <Avatar size={size || 36} address={address} avatar={avatar} />
      <div className='DfAddressMini-popup'>
        <Popover
          trigger='hover'
          content={<ProfilePreview address={address} owner={owner}/>}
        >
          <span>
            <Link
              href={`/profile/${address}`}
            >
              <a className={`ui--AddressComponents-address ${className}`}>
                {fullname || username || (isShort ? toShortAddress(address) : address.toString())}
              </a>
            </Link>
          </span>
        </Popover>
        <InfoDetails details={details}/>
      </div>
      {children}
    </div>
  </div>;
};

export const AuthorPreviewWithOwner = withLoadedOwner(AuthorPreview);

export default AuthorPreviewWithOwner;

// ${asActivity && 'activity'}
