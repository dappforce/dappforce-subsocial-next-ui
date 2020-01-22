import React from 'react';
import { Bubble, InputAddress, Labelled } from '@polkadot/react-components';
import { AccountIndex, Balance, Nonce } from '@polkadot/react-query';

type Props = {
  label?: string,
  onChange: (accountId?: string) => void
};

type State = {
  accountId?: string
};

export default class AccountSelector extends React.PureComponent<Props, State> {

  state: State = {};

  render () {
    const { label } = this.props;
    const { accountId } = this.state;

    return <section>
      <InputAddress
        label={ label || 'My account' }
        onChange={this.onChange}
        type='account'
      />
      <Labelled>
        <Bubble label='Balance'>
          <Balance params={accountId} />
        </Bubble>
        <Bubble label='Transactions'>
          <Nonce params={accountId} />
        </Bubble>
        <Bubble icon='address card' label='Index'>
          <AccountIndex params={accountId} />
        </Bubble>
      </Labelled>
    </section>;
  }

  private onChange = (accountId?: string): void => {
    const { onChange } = this.props;
    this.setState({ accountId }, () => onChange(accountId));
  }
}
