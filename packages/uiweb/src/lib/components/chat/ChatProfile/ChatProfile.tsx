// @typescript-eslint/no-non-null-asserted-optional-chain

import { useContext, useEffect, useRef, useState } from 'react';

import styled from 'styled-components';
import type { IUser } from '@pushprotocol/restapi';
import { ethers } from 'ethers';
import { ToastContainer } from 'react-toastify';

import { Image, Section, Span } from '../../reusables';
import { useChatData, useClickAway } from '../../../hooks';
import { ThemeContext } from '../theme/ThemeProvider';
import useGetGroupByID from '../../../hooks/chat/useGetGroupByID';
import useChatProfile from '../../../hooks/chat/useChatProfile';
import { GroupInfoModal } from './GroupInfoModal';
import useMediaQuery from '../../../hooks/useMediaQuery';
import { createBlockie } from '../../space/helpers/blockies';
import { ProfileContainer } from '../reusables';
import 'react-toastify/dist/ReactToastify.min.css';

import { IGroup } from '../../../types';
import { isValidETHAddress } from '../helpers/helper';
import { IChatProfile, IChatTheme } from '../exportedTypes';
import { InfuraAPIKey, allowedNetworks, device } from '../../../config';
import { resolveNewEns, shortenText } from '../../../helpers';
import TokenGatedIcon from '../../../icons/TokenGatedIcon.svg';
import PublicChatIcon from '../../../icons/Public-Chat.svg';
import GreyImage from '../../../icons/greyImage.png';
import InfoIcon from '../../../icons/infodark.svg';
import VerticalEllipsisIcon from '../../../icons/VerticalEllipsis.svg';


type OptionProps = {
  options: boolean;
  setOptions: React.Dispatch<React.SetStateAction<boolean>>;
  isGroup: boolean;
  groupInfo: IGroup | null | undefined;
  setGroupInfo: React.Dispatch<React.SetStateAction<IGroup | null | undefined>>;
  theme: IChatTheme;
};

const Options = ({
  options,
  setOptions,
  isGroup,
  groupInfo,
  setGroupInfo,
  theme,
}: OptionProps) => {
  const DropdownRef = useRef(null);
  const [modal, setModal] = useState(false);

  useClickAway(DropdownRef, () => {
    setOptions(false);
  });

  const ShowModal = () => {
    setModal(true);
  };

  if (groupInfo && isGroup) {
    return (
      <Section
        zIndex="300"
        flexDirection="row"
        gap="10px"
        margin="0 20px 0 auto"
      >
        {/* {(groupInfo?.rules?.chat?.conditions || groupInfo.rules?.entry?.conditions) && (
          <Image
            src={TokenGatedIcon}
            height="24px"
            maxHeight="24px"
            width={'auto'}
          />
        )} */}
        <Image
          src={groupInfo?.isPublic ? PublicChatIcon : TokenGatedIcon}
          height="28px"
          maxHeight="32px"
          width={'auto'}
        />

        <ImageItem onClick={() => setOptions(true)}>
          <Image
            src={VerticalEllipsisIcon}
            height="21px"
            maxHeight="32px"
            width={'auto'}
            cursor="pointer"
          />

          {options && (
            <DropDownBar theme={theme} ref={DropdownRef}>
              <DropDownItem cursor="pointer" onClick={ShowModal}>
                <Image
                  src={InfoIcon}
                  height="21px"
                  maxHeight="21px"
                  width={'auto'}
                  cursor="pointer"
                />

                <TextItem cursor="pointer">Group Info</TextItem>
              </DropDownItem>
            </DropDownBar>
          )}

          {modal && (
            <GroupInfoModal
              theme={theme}
              setModal={setModal}
              groupInfo={groupInfo}
              setGroupInfo={setGroupInfo}
            />
          )}
        </ImageItem>
      </Section>
    );
  } else {
    return null;
  }
};

export const ChatProfile: React.FC<IChatProfile> = ({
  chatId,
  style,
}: {
  chatId: string;
  style: 'Info' | 'Preview';
}) => {
  const theme = useContext(ThemeContext);
  const { account, env } = useChatData();
  const { getGroupByID } = useGetGroupByID();
  const { fetchUserChatProfile } = useChatProfile();

  const [isGroup, setIsGroup] = useState<boolean>(false);
  const [options, setOptions] = useState(false);
  const [chatInfo, setChatInfo] = useState<IUser | null>();
  const [groupInfo, setGroupInfo] = useState<IGroup | null>();
  const [ensName, setEnsName] = useState<string | undefined>('');
  const isMobile = useMediaQuery(device.tablet);
  const l1ChainId = allowedNetworks[env].includes(1) ? 1 : 5;
  const provider = new ethers.providers.InfuraProvider(l1ChainId, InfuraAPIKey);

  const fetchProfileData = async () => {
    if (isValidETHAddress(chatId)) {
      const ChatProfile = await fetchUserChatProfile({ profileId: chatId });
      const result = await resolveNewEns(chatId, provider);
      setEnsName(result);
      setChatInfo(ChatProfile);
      setGroupInfo(null);
      setIsGroup(false);
    } else {
      const GroupProfile = await getGroupByID({ groupId: chatId });
      setGroupInfo(GroupProfile);
      setChatInfo(null);
      setIsGroup(true);
    }
  };

  const getImage = () => {
    if (chatInfo || groupInfo) {
      return isGroup
        ? groupInfo?.groupImage ?? GreyImage
        : chatInfo?.profile?.picture ??
        createBlockie?.(chatId)?.toDataURL()?.toString();
    } else {
      return createBlockie?.(chatId)?.toDataURL()?.toString();
    }
  };

  const getProfileName = () => {
    return isGroup
      ? groupInfo?.groupName
      : ensName
        ? `${ensName} (${isMobile
          ? shortenText(chatInfo?.did?.split(':')[1] ?? '', 4, true)
          : chatId
        })`
        : chatInfo
          ? shortenText(chatInfo.did?.split(':')[1] ?? '', 6, true)
          : shortenText(chatId, 6, true);
  };

  useEffect(() => {
    if (!chatId) return;
    fetchProfileData();
  }, [chatId, account, env]);

  if (chatId && style === 'Info') {
    return (
      <Container theme={theme}>
        <ProfileContainer
          theme={theme}
          member={{ wallet: getProfileName() as string, image: getImage() }}
          customStyle={{ fontSize: '17px' }}
        />

        <Options
          options={options}
          setOptions={setOptions}
          isGroup={isGroup}
          groupInfo={groupInfo}
          setGroupInfo={setGroupInfo}
          theme={theme}
        />

        {/* {!isGroup && 
                    <VideoChatSection>
                        <Image src={VideoChatIcon} height="18px" maxHeight="18px" width={'auto'} />
                    </VideoChatSection>
                    } */}

        <ToastContainer />
      </Container>
    );
  } else {
    return null;
  }
};

const Container = styled.div`
  width: 100%;
  background: ${(props) => props.theme.backgroundColor.chatProfileBackground};
  border: ${(props) => props.theme.border?.chatProfile};
  border-radius: ${(props) => props.theme.borderRadius?.chatProfile};
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 6px;
  box-sizing: border-box;
  position: relative;
`;

const ImageItem = styled.div`
  position: relative;
`;

const DropDownBar = styled.div`
  position: absolute;
  top: 30px;
  left: -130px;
  display: block;
  min-width: 140px;
  color: rgb(101, 119, 149);
  background: ${(props) => props.theme.backgroundColor.modalBackground};
  border: ${(props) => props.theme.border.modalInnerComponents};
  z-index: 10;
  border-radius: ${(props) => props.theme.borderRadius.modalInnerComponents};
`;

const VideoChatSection = styled.div`
  margin: 0 25px 0 auto;
`;

const DropDownItem = styled(Span)`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 16px;
  z-index: 3000000;
  width: 100%;
`;

const TextItem = styled(Span)`
  white-space: nowrap;
  overflow: hidden;
`;

//auto update members when an user accepts not done
