export type Divider = 'Divider'

export const Divider: Divider = 'Divider'

export type PageLink = {
  name: string
  page: string[]
  image: string

  // Helpers
  isNotifications?: boolean
  isAdvanced?: boolean
}

type MenuItem = PageLink | Divider

export const isDivider = (item: MenuItem): item is Divider =>
  item === Divider

export const isPageLink = (item: MenuItem): item is PageLink =>
  !isDivider(item)

export const DefaultMenu: MenuItem[] = [
  {
    name: 'Explore',
    page: [ '/blogs/all' ],
    image: 'global'
  },
  {
    name: 'Advanced',
    page: [ '/bc' ],
    image: 'block',
    isAdvanced: true
  }
];

export const buildAuthorizedMenu = (myAddress: string): MenuItem[] => [
  {
    name: 'My feed',
    page: [ '/feed' ],
    image: 'profile'
  },
  {
    name: 'My notifications',
    page: [ '/notifications' ],
    image: 'notification',
    isNotifications: true
  },
  {
    name: 'My subscriptions',
    page: [ '/blogs/following/[address]', `/blogs/following/${myAddress}` ],
    image: 'book'
  },
  {
    name: 'My profile',
    page: [ '/profile/[address]', `/profile/${myAddress}` ],
    image: 'user'
  },
  {
    name: 'My blogs',
    page: [ '/blogs/my/[address]', `/blogs/my/${myAddress}` ],
    image: 'book'
  },
  {
    name: 'New blog',
    page: [ '/blogs/new' ],
    image: 'plus'
  },
  Divider,
  ...DefaultMenu
]
