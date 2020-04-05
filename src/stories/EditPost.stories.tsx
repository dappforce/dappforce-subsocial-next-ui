import React from 'react';
import '../components/utils/styles/subsocial.css';
import { withStorybookContext } from './withStorybookContext';
import { InnerEditPost } from '../components/posts/EditPost';
import { BlogId, Post, PostId, PostContent } from '../components/types';
import { U32 } from '@polkadot/types';

export default {
  title: 'EditPost',
  decorators: [ withStorybookContext ]
};

const mockBlogId = new BlogId(99);

const mockStruct = {
  id: new PostId(10),
  blog_id: mockBlogId
} as unknown as Post

const mockJson: PostContent = {
  title: 'Example post',
  image: '',
  body: 'Description',
  tags: [ 'qwe', 'asd', 'zxc' ],
  canonical: '/qwe'
}

export const NewPost = () =>
  <InnerEditPost blogId={mockBlogId} postMaxLen={new U32(15)} />

export const EditPost = () =>
  <InnerEditPost blogId={mockBlogId} struct={mockStruct} json={mockJson} postMaxLen={new U32(15)} />
