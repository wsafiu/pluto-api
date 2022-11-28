const { UserModel } = require('../models') 
const { APIError, STATUS_CODES} = require('../../utils/app-errors')


class UserRepository {

    async CreateUser({username, password, fullname, email}) {
        try {
            const newUser = new UserModel({
                username,
                email,
                fullname,
            });
            await newUser.setPassword(password);
            await newUser.save(); // user created

            const { user } = await UserModel.authenticate()(username, password);
            console.log(user);
            return user;

        }catch (e) {
            console.log(e)
            throw new APIError('API ERROR', STATUS_CODES.INTERNAL_ERROR, "user already exist")
        }
    }

    async FindUser({ username }){
        try{
            const existingUser = await UserModel.findOne({ username: username})
            return existingUser;
        }catch(err){
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Customer')
        }
    }

    async FindUserById({ id }){
        try{
            const existingUser = await UserModel.findById(id);
            return existingUser;
        }catch(err){
            throw APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Customer')
        }
    }

    async updateUser(id, update) {
        try {

            const updateUser = await UserModel.findByIdAndUpdate(id, update);
            return updateUser;

        } catch (e) {
            throw new APIError('API Error', STATUS_CODES.INTERNAL_ERROR, 'Unable to Find Customer')
        }
    }
    

}

module.exports = UserRepository;