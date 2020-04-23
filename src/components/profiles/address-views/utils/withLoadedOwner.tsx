import React, { useEffect, useState } from 'react'
import { newLogger } from '@subsocial/utils';
import { useSubsocialApi } from '../../../utils/SubsocialApiContext';
import { ProfileData } from '@subsocial/types';
import { CommonAddressProps } from './types'
import { Loading } from '../../../utils/utils';

const log = newLogger(withLoadedOwner.name)

type Props = CommonAddressProps & {
  myAddress?: string
};

export function withLoadedOwner (Component: React.ComponentType<any>) {
  return function (props: any) {
    const { myAddress, owner: initialOwner, address = myAddress } = props as Props;

    if (initialOwner) return <Component {...props} />;

    log.debug('Profile is not loaded yet for this address:', address)

    const { subsocial } = useSubsocialApi()
    const [ owner, setOwner ] = useState<ProfileData>();

    useEffect(() => {
      if (!address) return;

      let isSubscribe = true;
      const loadContent = async () => {
        const owner = await subsocial.findProfile(address)
        isSubscribe && setOwner(owner)
      }

      loadContent().catch(err =>
        log.error('Failed to load profile data:', err));

      return () => { isSubscribe = false; };
    }, [ address?.toString() ]);

    return owner ? <Component {...props} owner={owner} /> : <Loading />;
  };
}
