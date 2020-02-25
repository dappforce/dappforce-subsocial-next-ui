
import React, { useState } from 'react';

import { withKnobs } from '@storybook/addon-knobs';
import { Menu, Icon, Button, Avatar } from 'antd';
import ListForumTopics from './ListForumTopics';
import ViewForum from './ViewForum';
import faker from 'faker';

import './style.css';

import substrateLogo from '@polkadot/ui-assets/notext-parity-substrate-white.svg';
import NavigationEditor, { NavEditorFormProps } from './navigation-editor/NavigationEditor';
import { PostId } from '../types';
import QuoteApp from './drag-n-drop/DragNDrop';

const { SubMenu } = Menu;

const items = [{ avatar: faker.image.avatar(), name: faker.company.companyName() },
{ avatar: faker.image.avatar(), name: faker.company.companyName() },
{ avatar: faker.image.avatar(), name: faker.company.companyName() },
{ avatar: faker.image.avatar(), name: faker.company.companyName() },
{ avatar: faker.image.avatar(), name: faker.company.companyName() },
{ avatar: faker.image.avatar(), name: faker.company.companyName() },
{ avatar: faker.image.avatar(), name: faker.company.companyName() }];

const renderMenu = items.map((d, index) =>
  <Menu.Item key={index}>
    <Avatar style={{ marginRight: '.5rem' }} src={d.avatar} />
    <span>{d.name}</span>
  </Menu.Item>);

class App extends React.Component {
  state = {
    collapsed: false
  };

  toggleCollapsed = () => {
    this.setState({
      collapsed: !this.state.collapsed
    });
  }

  render() {
    return (
      <div style={{ width: 256 }}>
        <Button type='primary' onClick={this.toggleCollapsed} style={{ marginBottom: 16 }}>
          <Icon type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'} />
        </Button>
        <Menu
          defaultSelectedKeys={['1']}
          defaultOpenKeys={['sub1']}
          mode='inline'
          theme='light'
          inlineCollapsed={this.state.collapsed}
        >
          <Menu.Item key='menu1'>
            <Icon type='notification' />
            <span>My Feed</span>
          </Menu.Item>
          <SubMenu
            key='sub1'
            title={
              <span>
                <span>Spaces I follow</span>
              </span>
            }
          >
            {renderMenu}
          </SubMenu>
        </Menu>
      </div>
    );
  }
}

export default {
  title: 'Examples | States',
  decorators: [withKnobs]
};

export const DefaultState = () => {
  return <>DefaultState</>;
};

export const AntSidebar = () => <App />;

type MenuItem = {
  name: string,
  route: string,
  image: string
};

const MenuItems: MenuItem[] = [
  {
    name: 'All blogs',
    route: '/all',
    image: 'notification'
  },
  {
    name: 'My blogs',
    route: '/my-blogs',
    image: 'notification'
  },
  {
    name: 'Following blogs',
    route: '/following-blogs',
    image: 'notification'
  },
  {
    name: 'Feed',
    route: '/feed',
    image: 'notification'
  },
  {
    name: 'Notifications',
    route: '/notifications',
    image: 'notification'
  }
];

export const Navigations = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div style={{ width: 256 }}>
      <Button type='primary' onClick={toggleCollapsed} style={{ marginBottom: 16 }}>
        <Icon type={collapsed ? 'menu-unfold' : 'menu-fold'} />
      </Button>
      <Menu
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['sub1']}
        mode='inline'
        theme='light'
        inlineCollapsed={collapsed}
      >
        <Menu.Item style={{ marginRight: '1.5em' }}>
          <Avatar style={{ marginRight: '.5rem' }} src={substrateLogo} />
          <span style={{ fontSize: '1.5rem' }}>Subsocial</span>
        </Menu.Item>
        {MenuItems.map((item, index) => <Menu.Item key={index}>
          <Icon type={item.image} />
          <span>{item.name}</span>
        </Menu.Item>)}
      </Menu>
    </div>
  );
};

export const ListForum = () => {
  return <ListForumTopics data={[]} />
};

export const Forum = () => {
  return (<ViewForum />);
}


export const NavigationEditorExample = () => {
  const NavProps: NavEditorFormProps = {
    tagsData: ['tag1', 'tag2', 'tag3'],
    posts: [
      { id: new PostId('3'), title: 'Post title (id: 3)' },
      { id: new PostId('4'), title: 'Post title (id: 4)' }
    ],
    navTabs: [
      { id: 1, title: 'first name', type: 'by-tag', description: '', content: { tags: ['first', 'value'] }, hidden: false, },
      { id: 2, title: 'second name', type: 'ext-url', description: '', content: { url: 'http://google.com' }, hidden: false, },
      { id: 3, title: 'third name', type: 'blog-url', description: '', content: { postId: new PostId('3') }, hidden: false, },
      { id: 4, title: 'fourth name', type: 'ext-url', description: '', content: { url: 'http://ya.ru' }, hidden: true, },
      { id: 5, title: 'fifth name', type: 'by-tag', description: '', content: { tags: ['fifth', 'value'] }, hidden: false, },
    ],
    typesOfContent: [
      'by-tag', 'ext-url', 'blog-url'
    ]
  }

  return <NavigationEditor {...NavProps} />
}

export const QuoteAppExample = () => {
  return <QuoteApp />
}