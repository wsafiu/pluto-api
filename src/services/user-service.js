const { UserRepository } = require('../database');
const { APIError, BadRequestError } = require('../utils/app-errors');
const { FormatData, SendMail, initiateError } = require('../utils');


class UserService {

    constructor() {
        this.repository = new UserRepository()
    }

    async signUp( userInputs ) {
        console.log(userInputs)
        try {
            const user = await this.repository.CreateUser(userInputs);
            await SendMail(user);
            this.repository.updateUser(user._id, { isActivate: false, linkExpired: Date.now() + (3600 * 1000 * 24) })

            return FormatData({success: true, msg: "Registration successful"});
        }catch (e) {
            throw new BadRequestError(e.message, e)
        }
    }

    async activateUser (id) {
        try {
            const updateUser = await this.repository.updateUser(id, { isActivate: true, linkExpired: 0 })

            if (!updateUser) {
                initiateError(422, "User not found!!!");
            }
            if (updateUser.linkExpired < Date.now()) {
                initiateError(422, "linked already expired!!!");
            }
            // return FormatData({success: true, msg: "User activated successfully"});
            return FormatData(updateUser);
        }catch (e) {
            throw new BadRequestError(e.message || 'User activation fail', e)
        }
    }

}

module.exports = UserService;
