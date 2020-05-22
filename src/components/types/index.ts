import { types } from '@subsocial/types/substrate/preparedTypes'
import { registry } from '@polkadot/react-api';
import { newLogger } from '@subsocial/utils';
const log = newLogger('types')
export const registerSubsocialTypes = (): void => {
  try {
    registry.register(types);
    log.info('Succesfully registered custom types of Subsocial modules')
  } catch (err) {
    log.error('Failed to register custom types of Subsocial modules:', err);
  }
};

// export type IpfsData = PostBlock | BlockValue;

export type PostBlockKind = 'text' | 'code' | 'link' | 'image' | 'video'

export interface PostBlock {
  kind: PostBlockKind
  hidden?: boolean
  featured?: boolean
  /** CID aka IPFS hash */
  cid: string
}

export type BlockValueKind = BlockValue | CodeBlockValue | ImageBlockValue

export type BlockValueWithOptions = BlockValueKind & {
  featured: boolean
}

export interface BlockValue {
  id: number
  kind: PostBlockKind
  hidden?: boolean
  data: string
}

export interface CodeBlockValue extends BlockValue {
  lang: string
}

export interface ImageBlockValue extends BlockValue {
  hash: string
  description?: string
}

export type SharedPostContent = {
  blocks: PostBlock[]
};

export type PostContent = SharedPostContent & {
  title: string;
  image: string;
  tags: string[];
  canonical: string;
};

export interface SiteMetaContent {
  og?: {
    title?: string,
    description?: string,
    image: string,
    url: string
  },
  title?: string,
  description?: string
}

export type PreviewData = {
  id: number,
  data: SiteMetaContent
}

export type EmbedData = {
  id: number,
  data: string,
  type: string
}

export default registerSubsocialTypes;
