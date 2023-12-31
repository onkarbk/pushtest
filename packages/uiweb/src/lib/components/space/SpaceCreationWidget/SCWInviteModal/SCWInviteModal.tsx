/* eslint-disable no-prototype-builtins */
import React, { useState, MouseEventHandler, useContext } from 'react'
import styled, { ThemeProvider } from 'styled-components'
import * as PushAPI from '@pushprotocol/restapi';

import { ModalHeader } from '../../reusables/ModalHeader';
import { Modal } from '../../reusables/Modal';
import { Button } from '../../reusables/Button';
import { SearchInput } from '../../reusables/SearchInput';
import { ProfileContainer } from '../../reusables/ProfileContainer';
import { ThemeContext } from '../../theme/ThemeProvider';
import { Spinner } from '../../reusables/Spinner';
import { createIcon } from '../../helpers/blockies';

import CircularProgressSpinner from '../../../loader/loader';

import { useSpaceData } from '../../../../hooks';
import SettingsIcon from '../../../../icons/settingsBlack.svg';
import { SettingsLogo } from '../../../../icons/SettingsLogo';
import { Image } from '../../../../config';


export interface ICustomSearchResult {
    account: string;
    name?: string;
    handle?: string;
    image?: string; // dataURL as string
}

export interface ISCWIModalProps { // Space Creation Widget Create Modal Interface
    closeInviteModal?: MouseEventHandler;
    makeScheduleVisible?: MouseEventHandler;
    createSpace?: MouseEventHandler;
    isLoading?: boolean;
    invitedMembersList?: any;
    setInvitedMembersList?: any;
    invitedAddressList?: any;
    setInvitedAddressList?: any;
    adminsList?: any;
    setAdminsList?: any;
    adminsAddressList?: any;
    setAdminsAddressList?: any;
    onClose: any;
    btnString?: string;
}

export const SCWInviteModal: React.FC<ISCWIModalProps> = (props) => {
    const {
        closeInviteModal, makeScheduleVisible, createSpace, isLoading,
        invitedMembersList,
        setInvitedMembersList,
        invitedAddressList,
        setInvitedAddressList,
        adminsList,
        setAdminsList,
        adminsAddressList,
        setAdminsAddressList,
        onClose,
        btnString,
    } = props;
    const theme = useContext(ThemeContext);

    const { env, account, customSearch } = useSpaceData();

    const [invitedMember, setInvitedMember] = useState('')
    const [loadingAccount, setLoadingAccount] = useState(false)

    const [searchedUser, setSearchedUser]= useState<any>({});
    const [errorMsg, setErrorMsg] = useState<string>('');

    const searchMember = async (event: any) => {
        setInvitedMember(event.target.value)

        if (event.target.value === account) {
            handleError('Cannot add Host to members');
            return;
        }

        if (customSearch) {
            const customUserResponse = customSearch(event.target.value);

            const hasAccount = (obj: any, uniqueKey: string) => {
                const keys = Object.keys(obj);
                return keys.length < 4 && keys[0] === uniqueKey;
            }

            if(hasAccount(customUserResponse, 'account')) {
                const icon = createIcon({
                    seed: customUserResponse.account,
                    size: 10,
                    scale: 3,
                });

                const searchedUser = {
                    handle: customUserResponse.account,
                    name: customUserResponse.account,
                    image: icon.toDataURL(),
                };

                setSearchedUser(searchedUser)
            } else {
                setSearchedUser(customUserResponse);
            }

            return;
        }

        try {
            setLoadingAccount(true);
            const response = await PushAPI.user.get({
                account: event.target.value,
                env,
            });

            if(response === null) {
                const icon = createIcon({
                    seed: event.target.value,
                    size: 10,
                    scale: 3,
                });

                const nullUser = {
                    handle: event.target.value,
                    name: event.target.value,
                    image: icon.toDataURL(),
                };

                setSearchedUser(nullUser)
            } else {
                setSearchedUser(response);
            }
            setErrorMsg('');
        } catch (e:any) {
            console.error(e.message);
            setSearchedUser({});
            setErrorMsg(e.message);
        } finally {
            setLoadingAccount(false);
        }
    }

    const clearInput = () => {
        setInvitedMember('');
        setSearchedUser({});
        setErrorMsg('');
    }

    const handleError = (errMsg: string) => {
        setErrorMsg(errMsg);
        setTimeout(() => {
            setErrorMsg('')
        }, 2000);
    }

    const handleInviteMember = (user: any) => {
        if(
            (invitedAddressList.length !== 0 && adminsAddressList.length !== 0)
            && (invitedAddressList.includes(user.did.substring(7)) || adminsAddressList.includes(user.did.substring(7)))
        ) {
            handleError('Already Invited');
            return;
        }

        if (user.did) {
            setInvitedAddressList([...invitedAddressList, user.did.substring(7)])
            setInvitedMembersList([...invitedMembersList, user]);
        } else {
            setInvitedAddressList([...invitedAddressList, user.handle])
            setInvitedMembersList([...invitedMembersList, user]);
        }

        clearInput();
    }

    const handlePromoteToAdmin = (user: any) => {
        if (user.did) {
            setAdminsList([...adminsList, user])
            setAdminsAddressList([...adminsAddressList, user.did.substring(7)]);
        } else {
            setAdminsList([...adminsList, user])
            setAdminsAddressList([...adminsAddressList, user.handle]);
        }

        const updatedArray = invitedMembersList.filter((item: any) => item !== user)
        setInvitedMembersList(updatedArray);

        if (user.did) {
            const updateAddressArray = invitedAddressList.filter((item: string) => item !== user.did.substring(7))
            setInvitedAddressList(updateAddressArray);
        } else {
            const updateAddressArray = invitedAddressList.filter((item: string) => item !== user.handle)
            setInvitedAddressList(updateAddressArray);
        }

        clearInput();
    }

    const handleDeleteInvitedUser = (user: any) => {
        const updatedArray = invitedMembersList.filter((item: any) => item !== user)
        setInvitedMembersList(updatedArray);

        if (user.did) {
            const updateAddressArray = invitedAddressList.filter((item: string) => item !== user.did.substring(7))
            setInvitedAddressList(updateAddressArray);
        } else {
            const updateAddressArray = invitedAddressList.filter((item: string) => item !== user.handle)
            setInvitedAddressList(updateAddressArray);
        }
    };

    const handleDeleteInvitedAdmin = (user: any) => {
        const updatedArray = adminsList.filter((item: any) => item !== user)
        setAdminsList(updatedArray);

        if (user.did) {
            const updateAdminAddressArray = adminsAddressList.filter((item: string) => item !== user.did.substring(7))
            setAdminsAddressList(updateAdminAddressArray);
        } else {
            const updateAddressArray = adminsAddressList.filter((item: string) => item !== user.handle)
            setAdminsAddressList(updateAddressArray);
        }
    };

    return (
        <ThemeProvider theme={theme}>
            <Modal
                clickawayClose={onClose}
            >
                <ModalHeader
                    heading='Invite members'
                    backCallback={makeScheduleVisible}
                    closeCallback={closeInviteModal}
                />

                <SearchInput
                    labelName='Add users'
                    inputValue={invitedMember}
                    onInputChange={searchMember}
                    clearInput={clearInput}
                />

                <ErrorMessage>{errorMsg}</ErrorMessage>

                <MembersList>
                    {loadingAccount && <Spinner />}
                    {
                        Object.keys(searchedUser).length === 0 ?
                        null
                        : searchedUser.hasOwnProperty('handle') ?
                        <ProfileContainer
                            imageHeight='48px'
                            handle={searchedUser.handle}
                            name={searchedUser.name}
                            imageUrl={searchedUser.image}
                            contBtn={<ContBtn>Add +</ContBtn>}
                            btnCallback={() => handleInviteMember(searchedUser)}
                            border
                        />
                        : <ProfileContainer
                            imageHeight='48px'
                            handle={searchedUser.did.substring(7)}
                            name={searchedUser.profile.name ?? searchedUser.did.substring(7)}
                            imageUrl={searchedUser.profile.picture}
                            contBtn={<ContBtn>Add +</ContBtn>}
                            btnCallback={() => handleInviteMember(searchedUser)}
                            border
                        />
                    }
                </MembersList>

                {
                    invitedMembersList.length ?
                    <InvitedList>
                        <Heading>Invited Members <PendingCount theme={theme}>{invitedMembersList.length}</PendingCount></Heading>
                        {
                            invitedMembersList.map((item: any) => {
                                if (item.hasOwnProperty('handle')) {
                                    return <ProfileContainer
                                        imageHeight='48px'
                                        handle={item.handle}
                                        name={item.name}
                                        imageUrl={item.image}
                                        contBtn={
                                            <SettingsCont>
                                              <SettingsLogo color={theme.textColorPrimary} />
                                            </SettingsCont>
                                        }
                                        removeCallback={() => handleDeleteInvitedUser(item)}
                                        promoteCallback={() => handlePromoteToAdmin(item)}
                                        border
                                    />
                                } else {
                                    return <ProfileContainer
                                        imageHeight='48px'
                                        handle={item.did.substring(7)}
                                        name={item.profile.name ?? item.did.substring(7)}
                                        imageUrl={item.profile.picture}
                                        contBtn={
                                            <SettingsCont>
                                              <SettingsLogo color={theme.textColorPrimary} />
                                            </SettingsCont>
                                        }
                                        removeCallback={() => handleDeleteInvitedUser(item)}
                                        promoteCallback={() => handlePromoteToAdmin(item)}
                                        border
                                    />
                                }
                            })
                        }
                    </InvitedList>
                    : null
                }

                {
                    adminsList.length ?
                    <InvitedList>
                        <Heading>Speakers <PendingCount theme={theme}>{adminsList.length}</PendingCount></Heading>
                        {
                            adminsList.map((item: any) => {
                                if (item.hasOwnProperty('handle')) {
                                    return <ProfileContainer
                                        imageHeight='48px'
                                        handle={item.handle}
                                        name={item.name}
                                        imageUrl={item.image}
                                        contBtn={
                                            <SettingsCont>
                                              <SettingsLogo color={theme.textColorPrimary} />
                                            </SettingsCont>
                                        }
                                        removeCallback={() => handleDeleteInvitedAdmin(item)}
                                        // promoteCallback={() => handlePromoteToAdmin(item)}
                                        border
                                    />
                                } else {
                                    return <ProfileContainer
                                        imageHeight='48px'
                                        handle={item.did.substring(7)}
                                        name={item.profile.name ?? item.did.substring(7)}
                                        imageUrl={item.profile.picture}
                                        contBtn={
                                            <SettingsCont>
                                              <SettingsLogo color={theme.textColorPrimary} />
                                            </SettingsCont>
                                        }
                                        removeCallback={() => handleDeleteInvitedAdmin(item)}
                                        // promoteCallback={() => handlePromoteToAdmin(item)}
                                        border
                                    />
                                }
                            })
                        }
                    </InvitedList>
                    : null
                }

                <Button
                    onClick={createSpace}
                    width='max-content'
                >
                    {
                        isLoading ?
                        <CircularProgressSpinner />
                        : btnString ?? 'Create Space'
                    }
                </Button>
            </Modal>
        </ThemeProvider>
    )
}


const MembersList = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;
`;

const InvitedList = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 8px;

    margin-top: 28px;
`;

const Heading = styled.div`
    display: flex;
    align-items: center;
`;

const PendingCount = styled.div`
    background: ${(props => props.theme.btnColorPrimary)};
    border-radius: 8px;
    padding: 4px 10px;
    margin-left: 6px;
    font-size: 13px;
    color: ${(props => props.theme.titleTextColor)};
`;

const SettingsCont = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;

    cursor: pointer;
`;

const ContBtn = styled.button`
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 8px;
    line-height: 18px;
    width: max-content;
    background: transparent;
    color: ${props => props.theme.btnColorPrimary};
    border-radius: 6px;
    font-weight: 500;
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 8px;
    border: 1px solid ${props => props.theme.btnOutline};
    cursor: pointer;
`;

const ErrorMessage = styled.div`
    color: #E93636;
    font-size: 14px;
    margin-bottom: 8px;
`;
