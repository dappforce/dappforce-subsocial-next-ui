import React, { useState } from 'react';
import { Button } from 'semantic-ui-react';
import { Form, Field, withFormik, FormikProps } from 'formik';
import * as Yup from 'yup';

import { Option, Text, AccountId, U32 } from '@polkadot/types';
import Section from '../utils/Section';
import dynamic from 'next/dynamic';
import { SubmittableResult } from '@polkadot/api';
import { withCalls, withMulti } from '@polkadot/ui-api';

import { addJsonToIpfs, removeFromIpfs } from '../utils/OffchainUtils';
import * as DfForms from '../utils/forms';
import { ProfileContent, Profile, ProfileUpdate, SocialAccount } from '../types';
import { withSocialAccount, withRequireProfile } from '../utils/utils';
import { queryBlogsToProp } from '../utils/index';
import { withMyAccount, MyAccountProps } from '../utils/MyAccount';

import SimpleMDEReact from 'react-simplemde-editor';
import Router from 'next/router';
import HeadMeta from '../utils/HeadMeta';
const TxButton = dynamic(() => import('../utils/TxButton'), { ssr: false });

// TODO get next settings from Substrate:
const USERNAME_REGEX = /^[A-Za-z0-9-]+$/;

const URL_MAX_LEN = 2000;

const FULLNAME_MIN_LEN = 2;
const FULLNAME_MAX_LEN = 100;

const ABOUT_MAX_LEN = 1000;

function urlValidation (name: string) {
  return Yup.string()
    .url(`${name} URL is not valid.`)
    .max(URL_MAX_LEN, `${name} URL is too long. Maximum length is ${URL_MAX_LEN} chars.`);
}

const buildSchema = (p: ValidationProps) => Yup.object().shape({
  username: Yup.string()
    .required('Username is required')
    .matches(USERNAME_REGEX, 'Username can have only letters (a-z, A-Z), numbers (0-9), underscores (_) and dashes (-).')
    .min(p.usernameMinLen, `Username is too short. Minimum length is ${p.usernameMinLen} chars.`)
    .max(p.usernameMaxLen, `Username is too long. Maximum length is ${p.usernameMaxLen} chars.`),

  fullname: Yup.string()
    .min(FULLNAME_MIN_LEN, `Full name is too short. Minimum length is ${FULLNAME_MIN_LEN} chars.`)
    .max(FULLNAME_MAX_LEN, `Full name is too long. Maximum length is ${FULLNAME_MAX_LEN} chars.`),

  avatar: Yup.string()
    .url('Avatar must be a valid URL.')
    .max(URL_MAX_LEN, `Avatar URL is too long. Maximum length is ${URL_MAX_LEN} chars.`),

  email: Yup.string()
    .email('Enter correct email address'),

  personal_site: urlValidation('Personal site'),

  about: Yup.string()
    .max(ABOUT_MAX_LEN, `Text is too long. Maximum length is ${ABOUT_MAX_LEN} chars.`),

  facebook: urlValidation('Facebook'),

  twitter: urlValidation('Twitter'),

  linkedIn: urlValidation('LinkedIn'),

  github: urlValidation('GitHub'),

  instagram: urlValidation('Instagram')
});

type ValidationProps = {
  usernameMinLen: number,
  usernameMaxLen: number
};

export type OuterProps = MyAccountProps & ValidationProps & {
  myAddress?: AccountId,
  profile?: Profile,
  ProfileContent?: ProfileContent,
  socialAccount?: SocialAccount,
  requireProfile?: boolean,
  usernameMinLen: U32,
  usernameMaxLen: U32
};

type FormValues = ProfileContent & {
  username: string;
};

type FormProps = OuterProps & FormikProps<FormValues>;

const LabelledField = DfForms.LabelledField<FormValues>();

const LabelledText = DfForms.LabelledText<FormValues>();

const InnerForm = (props: FormProps) => {
  const {
    myAddress,
    profile,
    values,
    errors,
    dirty,
    isValid,
    setFieldValue,
    isSubmitting,
    setSubmitting,
    resetForm
  } = props;

  const {
    username,
    fullname,
    avatar,
    email,
    personal_site,
    about,
    facebook,
    twitter,
    linkedIn,
    github,
    instagram
  } = values;

  const goToView = () => {
    if (myAddress) {
      Router.push(`/profile/${myAddress}`).catch(console.log);
    }
  };

  const [ ipfsCid, setIpfsCid ] = useState('');

  const onSubmit = (sendTx: () => void) => {
    if (isValid) {
      const json = { fullname, avatar, email, personal_site, about, facebook, twitter, linkedIn, github, instagram };
      addJsonToIpfs(json).then(cid => {
        setIpfsCid(cid);
        sendTx();
      }).catch(err => new Error(err));
    }
  };

  const onTxCancelled = () => {
    removeFromIpfs(ipfsCid).catch(err => new Error(err));
    setSubmitting(false);
  };

  const onTxFailed = (_txResult: SubmittableResult) => {
    removeFromIpfs(ipfsCid).catch(err => new Error(err));
    setSubmitting(false);
  };

  const onTxSuccess = (_txResult: SubmittableResult) => {
    setSubmitting(false);
    goToView();
  };

  const buildTxParams = () => {
    if (!isValid) return [];

    if (!profile) {
      return [ username, ipfsCid ];
    } else {
      // TODO update only dirty values.
      const update = new ProfileUpdate({
        username: new Option(Text, username),
        ipfs_hash: new Option(Text, ipfsCid)
      });
      return [ update ];
    }
  };

  const title = profile ? `Edit profile` : `New profile`;
  const shouldBeValidUrlText = `Should be a valid URL.`;

  return (<>
    <HeadMeta title={title}/>
    <Section className='EditEntityBox bookPage' title={title}>
      <Form className='ui form DfForm EditEntityForm'>

        <LabelledText
          name='username'
          label='Username'
          placeholder={`You can use a-z, 0-9, dashes and underscores.`}
          style={{ maxWidth: '30rem' }}
          {...props}
        />

        <LabelledText
          name='fullname'
          label='Fullname'
          placeholder='Enter your fullname'
          {...props}
        />

        <LabelledText
          name='avatar'
          label='Avatar URL'
          placeholder={`Should be a valid image URL.`}
          {...props}
        />

        <LabelledText
          name='email'
          label='Email'
          placeholder='Enter your email'
          {...props}
        />

        <LabelledText
          name='personal_site'
          label='Personal site'
          placeholder='Address for personal site'
          {...props}
        />

        <LabelledText
          name='facebook'
          label='Facebook profile'
          placeholder={shouldBeValidUrlText}
          {...props}
        />

        <LabelledText
          name='twitter'
          label='Twitter profile'
          placeholder={shouldBeValidUrlText}
          {...props}
        />

        <LabelledText
          name='linkedIn'
          label='LinkedIn profile'
          placeholder={shouldBeValidUrlText}
          {...props}
        />

        <LabelledText
          name='github'
          label='GitHub profile'
          placeholder={shouldBeValidUrlText}
          {...props}
        />

        <LabelledText
          name='instagram'
          label='Instagram profile'
          placeholder={shouldBeValidUrlText}
          {...props}
        />

        <LabelledField name='about' label='About' {...props}>
          <Field component={SimpleMDEReact} name='about' value={about} onChange={(data: string) => setFieldValue('about', data)} className={`DfMdEditor ${errors['about'] && 'error'}`} />
        </LabelledField>

        <LabelledField {...props}>
          <TxButton
            type='submit'
            size='medium'
            label={profile
              ? 'Update my profile'
              : 'Create my profile'
            }
            isDisabled={!dirty || isSubmitting}
            params={buildTxParams()}
            tx={profile
              ? 'blogs.updateProfile'
              : 'blogs.createProfile'
            }
            onClick={onSubmit}
            txCancelledCb={onTxCancelled}
            txFailedCb={onTxFailed}
            txSuccessCb={onTxSuccess}
          />
          <Button
            type='button'
            size='medium'
            disabled={!dirty || isSubmitting}
            onClick={() => resetForm()}
            content='Reset form'
          />
        </LabelledField>
      </Form>
    </Section>
  </>
  );
};

const EditForm = withFormik<OuterProps, FormValues>({

  // Transform outer props into form values
  mapPropsToValues: (props): FormValues => {
    const { profile, ProfileContent } = props;
    if (profile && ProfileContent) {
      const username = profile.username.toString();
      return {
        username,
        ...ProfileContent
      };
    } else {
      return {
        username: '',
        fullname: '',
        avatar: '',
        about: '',
        facebook: '',
        twitter: '',
        linkedIn: '',
        github: '',
        instagram: '',
        email: '',
        personal_site: ''
      };
    }
  },

  validationSchema: (props: OuterProps) => buildSchema({
    usernameMinLen: props.usernameMinLen.toNumber(),
    usernameMaxLen: props.usernameMaxLen.toNumber()
  }),

  handleSubmit: values => {
    // do submitting things
  }
})(InnerForm);

export const EditFormWithValidation = withMulti(
  EditForm,
  withCalls<OuterProps>(
    queryBlogsToProp('usernameMinLen', { propName: 'usernameMinLen' }),
    queryBlogsToProp('usernameMaxLen', { propName: 'usernameMaxLen' })
  )
);

export const NewProfile = withMulti(
  EditFormWithValidation,
  withMyAccount
);

export const EditProfile = withMulti(
  EditFormWithValidation,
  withMyAccount,
  withCalls<OuterProps>(
    queryBlogsToProp('socialAccountById', { paramName: 'myAddress', propName: 'socialAccountOpt' })
  ),
  withRequireProfile,
  withSocialAccount
);

export default NewProfile;
