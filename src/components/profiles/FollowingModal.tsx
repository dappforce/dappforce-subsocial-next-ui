import React, { useState } from 'react';

import { withCalls, withMulti } from '@polkadot/react-api';
import { GenericAccountId as AccountId } from '@polkadot/types';
import { socialQueryToProp } from '../utils/index';
import { Modal, Button } from 'semantic-ui-react';
import { TX_BUTTON_SIZE } from '../../config/Size.config';
import { ProfilePreviewWithOwner } from './address-views';

type Props = {
  following?: AccountId[],
  followingCount: number
};

const InnerFollowingModal = (props: Props) => {
  const { following, followingCount } = props;
  const [ open, setOpen ] = useState(false);

  const renderFollowing = () => {
    return following && following.map((account) =>
      <div key={account.toString()} className='DfModal'>
        <ProfilePreviewWithOwner
          address={account}
          size={48}
          mini
        />
      </div>
    );
  };

  return (
    <Modal
      size='small'
      onClose={close}
      open={open}
      trigger={<Button basic onClick={() => setOpen(true)}>Following ({followingCount})</Button>}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header>Following ({followingCount})</Modal.Header>
      <Modal.Content scrolling>
        {renderFollowing()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close'size={TX_BUTTON_SIZE} onClick={() => setOpen(false)} />
      </Modal.Actions>
    </Modal>
  );
};

export const AccountFollowingModal = withMulti(
  InnerFollowingModal,
  withCalls<Props>(
    socialQueryToProp('accountsFollowedByAccount', { paramName: 'id', propName: 'following' })
  )
);
