import {
    isValidETHAddress,
} from '../../helpers';

export const createGroupRequestValidator = (
    groupName: string, members: Array < string > , admins: Array < string > , groupCreator: string, contractAddressNFT ? : string,
    numberOfNFTs ? : number,
    contractAddressERC20 ? : string,
    numberOfERC20 ? : number,
): void => {

    if (groupName == null || groupName.length == 0) {
        throw new Error(`groupName cannot be null or empty`);
    }

    if (groupName.length >= 256) {
        throw new Error(`groupName cannot be more than 256 characters`);
    }

    if (members == null) {
        throw new Error(`members cannot be null`);
    }

    for (let i = 0; i < members.length; i++) {
        if (members[i] && !isValidETHAddress(members[i])) {
            throw new Error(`Invalid member address!`);
        }
    }

    if (admins == null) {
        throw new Error(`admins cannot be null`);
    }

    for (let i = 0; i < admins.length; i++) {
        if (!isValidETHAddress(admins[i])) {
            throw new Error(`Invalid admin address!`);
        }
    }

    if (!isValidETHAddress(groupCreator)) {
        throw new Error(`Invalid groupCreator address!`);
    }


    if (contractAddressNFT != null && contractAddressNFT?.length > 0 && !isValidETHAddress(contractAddressNFT)) {
        throw new Error(`Invalid contractAddressNFT address!`);
    }

    if (numberOfNFTs != null && numberOfNFTs < 0) {
        throw new Error(`numberOfNFTs cannot be negative number`);
    }

    if (contractAddressERC20 != null && contractAddressERC20?.length > 0 && !isValidETHAddress(contractAddressERC20)) {
        throw new Error(`Invalid contractAddressERC20 address!`);
    }

    if (numberOfERC20 != null && numberOfERC20 < 0) {
        throw new Error(`numberOfERC20 cannot be negative number`);
    }
};

export const updateGroupRequestValidator = (
    chatId: string, groupName: string, profilePicture: string, members: Array < string > ,
    admins: Array < string > , address: string
): void => {


    if (chatId == null || chatId.length == 0) {
        throw new Error(`chatId cannot be null or empty`);
    }

    if (groupName == null || groupName.length == 0) {
        throw new Error(`groupName cannot be null or empty`);
    }

    if (profilePicture == null || profilePicture.length == 0) {
        throw new Error(`profilePicture cannot be null or empty`);
    }

    if (groupName != null && groupName.length >= 256) {
        throw new Error(`groupName cannot be more than 256 characters`);
    }

    if (members != null && members.length > 0) {
        for (let i = 0; i < members.length; i++) {
            if (!isValidETHAddress(members[i])) {
                throw new Error(`Invalid member address in members list!`);
            }
        }
    }

    if (admins != null && admins.length > 0) {
        for (let i = 0; i < admins.length; i++) {
            if (!isValidETHAddress(admins[i])) {
                throw new Error(`Invalid member address in admins list!`);
            }
        }
    }

    if (address != null && !isValidETHAddress(address)) {
        throw new Error(`Invalid address field!`);
    }
};