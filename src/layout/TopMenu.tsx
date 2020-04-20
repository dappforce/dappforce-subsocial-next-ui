import React, { useState } from 'react';
import { Button, Icon } from 'antd';
import Search from '../components/search/Search';
import { isBrowser, isMobile, MobileView } from 'react-device-detect';
import { useSidebarCollapsed } from '../components/utils/SideBarCollapsedContext';
import { useMyAccount, useIsLoggedIn } from '../components/utils/MyAccountContext';
import LogInButton from '../components/utils/LogIn';
import Link from 'next/link';
import { AddressPopupWithAuthor } from 'src/components/profiles/address-views';

const InnerMenu = () => {
  const [ show, setShow ] = useState(isBrowser);
  const { toggle } = useSidebarCollapsed();
  const { state: { address } } = useMyAccount();
  const isLoggedIn = useIsLoggedIn();

  return isMobile && show
    ? <div className='DfTopBar DfTopBar--search'>
      <Search/>
      <Icon type='close-circle' className='DfCloseSearchIcon' onClick={() => setShow(false)} />
    </div>
    : <div className='DfTopBar'>
      <div className='DfTopBar--leftContent'>
        <Button type='link' onClick={toggle} className='DfBurgerIcon'>
          <Icon type='unordered-list' style={{ fontSize: '20px', color: '#999' }} theme='outlined' />
        </Button>
        <Link href='/'><a className='DfBrand'>{'Subsocial'}</a></Link>
      </div>
      {isBrowser && <Search/>}
      <div className='DfTopBar--rightContent'>
        <MobileView>
          {isMobile &&
          <Icon type='search' className='DfSearchIcon' onClick={() => setShow(true)} />}
        </MobileView>
        {isLoggedIn && address
          ? <AddressPopupWithAuthor
            className='profileName'
            address={address}
          /> : <LogInButton/>}
      </div>
    </div>;
};

export default InnerMenu;
