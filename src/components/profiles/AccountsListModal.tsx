import React from 'react';

import { withCalls, withMulti } from '@polkadot/ui-api/with';
import { AccountId } from '@polkadot/types';
import { queryBlogsToProp } from '../utils/index';
import { Modal, Button } from 'semantic-ui-react';
import { BUTTON_SIZE } from '../../config/Size.config';
import dynamic from 'next/dynamic';
const AddressComponents = dynamic(() => import('../utils/AddressComponents'), { ssr: false });
type Props = {
  accounts?: AccountId[],
  accountsCount: number,
  title: string,
  open: boolean,
  close: () => void
};

const InnerAccountsListModal = (props: Props) => {
  const { accounts, open, close, title } = props;

  const renderAccounts = () => {
    return accounts && accounts.map((account, index) =>
      <AddressComponents
        key={index}
        value={account}
        isShort={true}
        isPadded={false}
        size={30}
        withFollowButton
        variant='mini-preview'
      />
    );
  };

  return (
    <Modal
      size='small'
      onClose={close}
      open={open}
      centered={true}
      style={{ marginTop: '3rem' }}
    >
      <Modal.Header>{title}</Modal.Header>
      <Modal.Content scrolling>
        {renderAccounts()}
      </Modal.Content>
      <Modal.Actions>
        <Button content='Close' size={BUTTON_SIZE} onClick={close} />
      </Modal.Actions>
    </Modal>
  );
};

export const BlogFollowersModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    queryBlogsToProp('blogFollowers', { paramName: 'id', propName: 'accounts' })
  )
);

export const AccountFollowersModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    queryBlogsToProp('accountFollowers', { paramName: 'id', propName: 'accounts' })
  )
);

export const AccountFollowingModal = withMulti(
  InnerAccountsListModal,
  withCalls<Props>(
    queryBlogsToProp('accountsFollowedByAccount', { paramName: 'id', propName: 'accounts' })
  )
);
