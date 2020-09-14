import React, { useState, useCallback } from 'react'
import keyring from '@polkadot/ui-keyring';
import useSubsocialEffect from '../api/useSubsocialEffect';
import { ProfileData } from '@subsocial/types';
import { SelectAddressPreview, MyProfileProview } from '../profiles/address-views';
import { Button, Avatar } from 'antd';
import { useMyAccount, useMyAddress } from '../auth/MyAccountContext';
import { isWeb3Injected } from '@polkadot/extension-dapp';
import { useAuth } from '../auth/AuthContext';
import SubTitle from '../utils/SubTitle';

type SelectAccountItems = {
  accounts: string[],
  profilesByAddressMap: Map<string, ProfileData>
}

const SelectAccountItems = ({ accounts: addresses, profilesByAddressMap }: SelectAccountItems) => {
  const { setAddress, state: { address } } = useMyAccount()
  const { hideSignInModal } = useAuth()

  const AccountItem = useCallback((item: string) => <div
    key={item.toString()}
    className='SelectAccountItem'
    style={{ cursor: 'pointer', height: 'auto' }}
    onClick={async () => {
      await hideSignInModal()
      await setAddress(item)
    }}
  >
    <SelectAddressPreview address={item} owner={profilesByAddressMap.get(item)} />
  </div>, [ address || '', addresses.length ])

  return <div className='SelectAccountSection'>
    {addresses.map(AccountItem)}
  </div>
}

type AccountSelectorViewProps = {
  currentAddress?: string,
  extensionAddresses: string[],
  localAddresses: string[],
  developAddresses: string[],
  profilesByAddressMap: Map<string, ProfileData>
}

type AccountsPanelProps = {
  accounts: string[],
  kind: 'Extension' | 'Local' | 'Test'
}

const renderExtensionContent = (content: JSX.Element) => {
  return <>
    <SubTitle title={'Extension accounts:'} />
    {content}
  </>
}

export const AccountSelectorView = ({ currentAddress = '', extensionAddresses, localAddresses, developAddresses, profilesByAddressMap }: AccountSelectorViewProps) => {
  const NoExtension = useCallback(() => (
    <div>
      <div className='mb-4 mt-2'>
        <a className='DfBlackLink' href='https://github.com/polkadot-js/extension' target='_blank'>Polkadot extension</a>{' '}
        was not found or disabled. You can install it if you are using Chrome or Firefox browser.
      </div>
      <div className='mx-5'>
        <Button block className='mb-2' type='default' href='https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd?hl=de' target='_blank' >
          <Avatar size={20} src='chrome.svg' />
          <span className='ml-2'>Polkadot extension for Chrome</span>
        </Button>
        <Button block type='default' href='https://addons.mozilla.org/ru/firefox/addon/polkadot-js-extension/' target='_blank' >
          <Avatar size={20} src='firefox.svg' />
          <span className='ml-2'>Polkadot extension for Firefox</span>
        </Button>
      </div>
    </div>
  ), [])

  const NoAccounts = useCallback(() => (
    <div className='ml-3'>No accounts found. Please open your Polkadot extension and create a new account or import existing.</div>
  ), [])

  const CurrentAccount = useCallback(() => {
    if (!currentAddress) return <div className='m-3'>Click on your account to sign in:</div>

    return <>
      <div className='p-3 pb-0'>
        <MyProfileProview
          size={60}
          className='justify-content-center'
        />
      </div>
    </>
  }, [ currentAddress ])

  const AccountPanel = useCallback(({ accounts, kind }: AccountsPanelProps) => {
    const count = accounts.length;

    if (!count) return null

    return <>
      <SubTitle title={`${kind} accounts:`} />
      <SelectAccountItems accounts={accounts} profilesByAddressMap={profilesByAddressMap} />
    </>
  }, [])

  const ExtensionAccountPanel = () => {
    const count = extensionAddresses.length

    const isInjectCurrentAddress = currentAddress && keyring.getAccount(currentAddress)?.meta.isInjected // TODO hack for hide NoAccount msg!!!

    if (!isWeb3Injected) return <NoExtension />

    if (!count && isInjectCurrentAddress) return null

    if (!count) return renderExtensionContent(<NoAccounts />)

    return renderExtensionContent(
      <SelectAccountItems
        accounts={extensionAddresses}
        profilesByAddressMap={profilesByAddressMap}
      />
    )
  }

  return <div>
    <CurrentAccount />
    <ExtensionAccountPanel />
    <AccountPanel accounts={localAddresses} kind='Local' />
    <AccountPanel accounts={developAddresses} kind='Test'/>
  </div>
}

type AccountSelectorProps = {
  injectedAddresses?: string[]
}

export const useAccountSelector = ({ injectedAddresses }: AccountSelectorProps) => {
  const [ extensionAddresses, setExtensionAddresses ] = useState<string[]>(injectedAddresses || [])
  const [ localAddresses, setLocalAddresses ] = useState<string[]>()
  const [ developAddresses, setDevelopAddresses ] = useState<string[]>()
  const [ profilesByAddressMap ] = useState(new Map<string, ProfileData>())
  const currentAddress = useMyAddress()

  useSubsocialEffect(({ subsocial }) => {
    const accounts = keyring.getAccounts()
    if (!accounts) return

    const loadProfiles = async () => {
      const extensionAddresses: string[] = []
      const developAddresses: string[] = []
      const localAddresses: string[] = []

      const addresses = accounts.map(account => {
        const { address, meta } = account;

        if (address === currentAddress) return address

        if (meta.isInjected) {
          extensionAddresses.push(address)
        } else if (meta.isTesting) {
          developAddresses.push(address)
        } else {
          localAddresses.push(address)
        }
        return address
      })

      console.log('extensionAddresses', extensionAddresses)

      const uniqExtAddresses = new Set(extensionAddresses).values()

      setExtensionAddresses([ ...uniqExtAddresses ])
      setLocalAddresses(localAddresses)
      setDevelopAddresses(developAddresses)

      const profiles = await subsocial.findProfiles(addresses)

      profiles.forEach((item) => {
        const address = item.profile?.created.account.toString()
        address && profilesByAddressMap.set(address, item)
      })
    }

    loadProfiles().catch(err => console.error(err))// TODO change on logger
  }, [ currentAddress ])

  return {
    extensionAddresses,
    localAddresses,
    developAddresses,
    profilesByAddressMap,
    currentAddress
  }
}

export const AccountSelector = ({ injectedAddresses }: AccountSelectorProps) => {
  const {
    extensionAddresses,
    localAddresses,
    developAddresses,
    profilesByAddressMap,
    currentAddress
  } = useAccountSelector({ injectedAddresses })

  return !extensionAddresses || !localAddresses || !developAddresses
    ? null
    : <AccountSelectorView
      extensionAddresses={extensionAddresses}
      localAddresses={localAddresses}
      developAddresses={developAddresses}
      profilesByAddressMap={profilesByAddressMap}
      currentAddress={currentAddress}
    />
}
