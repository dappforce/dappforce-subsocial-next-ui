import React, { useState } from 'react';

import settings from '../components/settings';
import '@polkadot/react-components/i18n';
import '../components/utils/styles';

import dynamic from 'next/dynamic';
// import Suspense from '../components/utils/Suspense';
const Suspense = dynamic(() => import('../components/utils/Suspense'), { ssr: false });
import store from 'store';
import { getTypeRegistry } from '@polkadot/types';
import { Api } from '@polkadot/react-api';

import { QueueConsumer } from '@polkadot/react-components/Status/Context';
import Queue from '@polkadot/react-components/Status/Queue';
import { registerSubsocialTypes } from '../components/types';
import Connecting from '../components/main/Connecting';
// const Connecting = dynamic(() => import('../components/main/Connecting'), { ssr: false });
import Menu from './SideMenu';
import Signer from '@polkadot/react-signer';
import { MyAccountProvider } from '../components/utils/MyAccountContext';
import { QueueProps } from '@polkadot/react-components/Status/types';
import Status from '../components/main/Status';
import { ReactiveBase } from '@appbaseio/reactivesearch';
import { AllElasticIndexes, ElasticNodeURL } from '../config/ElasticConfig';
import { Layout } from 'antd';
import TopMenu from './TopMenu';
import { isBrowser, isMobile } from 'react-device-detect';
import { Drawer } from 'antd-mobile';

const { Header, Sider, Content } = Layout;

type Props = {
  children: React.ReactNode
};

console.log('The browser: ', isBrowser);

const SideMenu = (props: Props) => {
  const { children } = props;
  const [ collapsed, setCollapsed ] = useState(isMobile);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const DesktopNav = () => (
    <>
      <Sider
        width={250}
        className='DfSider'
        trigger={null}
        collapsed={collapsed}
      >
        <Menu collapsed={collapsed} closeSideBar={toggleCollapsed}/>
      </Sider>
      <Layout className='DfPageContent' style={{ padding: '0 24px 24px', marginLeft: collapsed ? '80px' : '250px' }}>
        <Content>{children}</Content>
      </Layout>
    </>
  );

  const MobileNav = () => (
    <Drawer
      className='DfMobileSideBar'
      style={{ minHeight: document.documentElement.clientHeight }}
      enableDragHandle
      contentStyle={{ color: '#A6A6A6', textAlign: 'center', paddingTop: 42 }}
      sidebar={<Menu collapsed={!collapsed} closeSideBar={toggleCollapsed}/>}
      open={!collapsed}
      onOpenChange={toggleCollapsed}
    >
      <Layout>
        <Content className='DfPageContent'>{children}</Content>
      </Layout>
    </Drawer>
  );

  return <ReactiveBase
    url={ElasticNodeURL}
    app={AllElasticIndexes.join(',')}
  >
  <Layout style={{ backgroundColor: '#fafafa !important' }}>
    <Header className='DfHeader'>
      <TopMenu toggleCollapsed={toggleCollapsed}/>
    </Header>
    <Layout style={{ marginTop: '60px' }}>
      {isBrowser
        ? <DesktopNav />
        : <MobileNav />
      }
    </Layout>
  </Layout>,
  </ReactiveBase>;
};

const NextLayout: React.FunctionComponent<any> = ({ children }) => {
  const url = process.env.SUBSTRATE_URL || settings.apiUrl || undefined;

  console.log('Web socket url=', url);

  try {
    registerSubsocialTypes();
    const types = store.get('types') || {};
    const names = Object.keys(types);

    if (names.length) {
      getTypeRegistry().register(types);
      console.log('Type registration:', names.join(', '));
    }
  } catch (error) {
    console.error('Type registration failed', error);
  }
  return <div id='root'>
    <Suspense fallback='...'>
      <Queue>
        <QueueConsumer>
          {({ queuePayload, queueSetTxStatus }) => {
            return (
              <Api
                queuePayload={queuePayload}
                queueSetTxStatus={queueSetTxStatus}
                url={url}
              >
                <MyAccountProvider>
                  <Signer>
                    <SideMenu>
                        <QueueConsumer>
                          {({ queueAction, stqueue, txqueue }: QueueProps) => (
                            <>
                              {children}
                              <Status
                                queueAction={queueAction}
                                stqueue={stqueue}
                                txqueue={txqueue}
                              />
                            </>
                          )}
                        </QueueConsumer>
                    </SideMenu>
                  </Signer>
                </MyAccountProvider>
                <Connecting />
              </Api>
            );
          }}
        </QueueConsumer>
      </Queue>
    </Suspense>
  </div>;
};

export default NextLayout;
