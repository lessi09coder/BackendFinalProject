const { createUserService, loginUserService, getUserEmailService, getUserIdService, updatePasswordService, deleteUserService, updateDocumentsService, generateDocumentURL } = require('../services/userServices.js');
const { getTokenByUserIdService, createTokenService, updateTokenService, deleteTokenByIdService } = require('../services/tokenService.js')
const path = require('path')
const { yesValidPass, isValidToken, createHash } = require('../utils/hashPass.js');
const { tokenRamdon } = require('../utils/TokenPassword.js')
const sendMailToUser = require('../utils/sendEmailUser.js')
const getUser = async (req, res) => {
    res.render("login", {})
};

const postUserLogin = async (req, res) => {
    try {        
        const username = req.body.user;        
        const loginUser = await loginUserService(username);
        const validatePass = yesValidPass(loginUser, req.body.password);        
        if (validatePass) {
            req.session.user = loginUser;            
            res.send({ status: "success", data: req.session, payload: `el usuario ${req.session.user} esta loggeado.` });
        } else {
            res.send({ status: "error", payload: "no se pudo loggear el usuario." })
        }
    } catch {
        res.status(500).send("hubo un error con el loggeo!")
    };
};

const getRegister = (req, res) => {
    res.render("register", {});
};

const getUserRegister = async (req, res) => {
    const newUserData = req.body;    
    const newUser = await createUserService(newUserData);
    res.send({ status: "success", data: newUser, payload: `el usuario ${req.session.user.user} esta loggeado.` })
};

const getSessionLogout = async (req, res) => {
    req.session.destroy(err => {
        if (!err) res.send('Logout ok!');
        else res.send({ status: 'Logout ERROR', body: err });
    })
};

const formForgotPassword = async (req, res) => {
    res.render("forgotPasswordHBS", { title: "Olvido su Password ?" })
}
const forgotPassword = async (req, res, next) => {
    try {
        const user = await getUserEmailService(req.body.email);
        const token = tokenRamdon();
        const expirationDate = new Date(Date.now() + 60 * 60 * 1000);
        const resetUrl = `${req.protocol}://${req.get('host')}/api/user/resetPassword`
        const tokenReset = await getTokenByUserIdService(user._id);
        if (tokenReset.error) {
            createTokenService(token, user._id, expirationDate);
        } else {
            tokenReset.token = createHash(token);
            tokenReset.expirationDate = expirationDate;
            await updateTokenService(tokenReset);
        }
        sendMailToUser(token, user.email, resetUrl);
        const currentTime = new Date();
        const timeDifference = expirationDate - currentTime;
        setTimeout(() => {
            deleteTokenByIdService(tokenReset._id)
        }, timeDifference);
        res.status(201).send({ status: "success", payload: `El token de recuperacion ha sido enviado al email: ${user.email}` })
    } catch (error) {
        next(error)
    }
}
const formResetPassword = async (req, res) => {
    res.render("resetPasswordHBS", { title: "Restaurar Password" })
}
const resetPassword = async (req, res, next) => {
    try {
        const userEmail = await getUserEmailService(req.body.email)        
        const password = req.body.password
        const newPassword = req.body.repeatPassword
        const tokenReset = await getTokenByUserIdService(userEmail._id);       
        const validToken = tokenReset.error ? null : isValidToken(tokenReset, req.body.token)
        if (!validToken) {
            res.status(403).send({ status: "error", payload: "Token Invalido" })
        }
        else {
            const validPassword = yesValidPass(userEmail, password);            
            if (validPassword) {
                res.status(422).send({ status: "error", payload: "La contraseña no puede ser igual a la anterior" })
            }
            else if (password !== newPassword) {
                res.status(422).send({ status: "error", payload: "Las contraseñas no coinciden" })
            }
            else {
                await updatePasswordService(userEmail._id, createHash(password))
                deleteTokenByIdService(tokenReset._id)
                res.status(200).send({ status: "success", payload: "Contraseña actualizada correctamente" })
            }
        }
    } catch (error) {
        next(error)
    }
}
const deleteUser = async (req, res, next) => {    
    try {
        const uid = req.params.uid
        const user = await getUserIdService(uid)
        const deleteUser = await deleteUserService(uid)        
        if (deleteUser.error) {
            throw new Error("Usuario Inexistente")
        }
        else {
            res.send({ status: "success", payload: `${user.user} ha sido eliminado`, data: deleteUser })
        }
    } catch (error) {
        next(error)
    }
}

const uploadForm = (req, res) => {
    const user = req.session.user;
    res.render('uploadDocs', { title: "Subir Docs", user });
};

const uploadDocuments = async (req, res, next) => {
    try {        
        const uid = req.params.uid;
        const user = await getUserIdService(uid);        
        const files = req.files;
        if (files && files.length > 0) {
            const documentStatus = files.map(file => ({
                name: path.parse(file.originalname).name,
                reference: generateDocumentURL(file, user.user),
            }));
            const updatedUser = await updateDocumentsService(uid, documentStatus);
            res.send({ status: "success", payload: `Documentos cargados correctamente`, data: updatedUser });
        } else {
            res.status(400).send({ status: "error", payload: "No se proporcionaron archivos" });
        }
    } catch (error) {
        next(error)
    }
}

module.exports = {
    postUserLogin,
    getRegister,
    getUser,
    getUserRegister,
    getSessionLogout,
    formForgotPassword,
    forgotPassword,
    formResetPassword,
    resetPassword,
    deleteUser,
    uploadForm,
    uploadDocuments
}