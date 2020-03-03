// Copyright 2017-2020 @polkadot/app-123code authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { SubmittableExtrinsic } from '@polkadot/api/promise/types';
import { QueueTx, QueueTxExtrinsicAdd } from '@polkadot/react-components/Status/types';
import { TxButtonProps as Props } from '@polkadot/react-components/types';

import React from 'react';
import { SubmittableResult } from '@polkadot/api';
import { withApi } from '@polkadot/react-api/hoc';
import { assert, isFunction, isUndefined } from '@polkadot/util';

import Button from '@polkadot/react-components/Button';
import { QueueConsumer } from '@polkadot/react-components/Status/Context';
import { useStorybookContext } from '../stories/StorybookContext';
import { withMyAccount, MyAccountProps } from './MyAccount';

interface InjectedProps {
  queueExtrinsic: QueueTxExtrinsicAdd;
  txqueue: QueueTx[];
}

type InnerProps = Props & InjectedProps & MyAccountProps & {
  onClick?: (sendTx: () => void) => void
};

interface State {
  extrinsic?: SubmittableExtrinsic;
  isSending: boolean;
}

class TxButtonInner extends React.PureComponent<InnerProps> {
  public state: State = {
    isSending: false
  };

  public render (): React.ReactNode {
    const { accountId, className, icon, iconSize, innerRef, isBasic, isDisabled, isNegative, isPrimary = !isBasic, isUnsigned, label, tooltip, onClick } = this.props;

    const { isSending } = this.state;
    const needsAccount = isUnsigned
      ? false
      : !accountId;

    return (
      <Button
        className={className}
        tooltip={tooltip}
        icon={icon}
        isBasic={isBasic}
        isDisabled={isSending || isDisabled || needsAccount}
        isLoading={isSending}
        isNegative={isNegative}
        isPrimary={
          isUndefined(isPrimary)
            ? (!isNegative && !isBasic)
            : isPrimary
        }
        label={label}
        onClick={() => {
          if (onClick) onClick(this.send);
          else this.send();
        }}
        ref={innerRef}
        size={iconSize}
      />
    );
  }

  protected send = (): void => {
    const { accountId, api, extrinsic: propsExtrinsic, isUnsigned, onClick, onFailed, onStart, onSuccess, onUpdate, params = [], queueExtrinsic, tx = '', withSpinner = true } = this.props;
    let extrinsic: any;

    if (propsExtrinsic) {
      extrinsic = propsExtrinsic;
    } else {
      const [section, method] = tx.split('.');

      assert(api.tx[section] && api.tx[section][method], `Unable to find api.tx.${section}.${method}`);

      extrinsic = api.tx[section][method](...(
        isFunction(params)
          ? params()
          : params
      ));
    }

    assert(extrinsic, 'Expected generated extrinsic passed to TxButton');

    if (withSpinner) {
      this.setState({ isSending: true });
    }

    queueExtrinsic({
      accountId,
      extrinsic,
      isUnsigned,
      txFailedCb: withSpinner ? this.onFailed : onFailed,
      txStartCb: onStart,
      txSuccessCb: withSpinner ? this.onSuccess : onSuccess,
      txUpdateCb: onUpdate
    });

    onClick && onClick();
  }

  private onFailed = (result: SubmittableResult | null): void => {
    const { onFailed } = this.props;

    this.setState({ isSending: false });

    onFailed && onFailed(result);
  }

  private onSuccess = (result: SubmittableResult): void => {
    const { onSuccess } = this.props;

    this.setState({ isSending: false });

    onSuccess && onSuccess(result);
  }
}

class TxButton extends React.PureComponent<InnerProps, State> {
  protected button: any = React.createRef();

  public render (): React.ReactNode {
    const { innerRef, ...props } = this.props;
    return (
      <QueueConsumer>
        {({ queueExtrinsic, txqueue }): React.ReactNode => (
          <TxButtonInner
            {...props}
            queueExtrinsic={queueExtrinsic}
            txqueue={txqueue}
            innerRef={innerRef}
          />
        )}
      </QueueConsumer>
    );
  }

  protected send = (): void => {
    this.button.current.send();
  }
}

function MockTxButton (props: InnerProps) {
  const { isPrimary = true, onClick } = props;

  const mockSendTx = () => {
    console.warn('WARN: Cannot send tx in a mock mode');
  };

  return (
    <Button
      {...props}
      icon=''
      isPrimary={isPrimary}
      onClick={() => {
        if (onClick) onClick(mockSendTx);
        else mockSendTx();
      }}
    />
  );
}

function ResolvedButton (props: any) { // TODO fix props type!
  const { isStorybook = false } = useStorybookContext();

  const Component = isStorybook
    ? MockTxButton
    : withApi(withMyAccount(TxButton));

  return <Component {...props} />;
}

export default ResolvedButton;
