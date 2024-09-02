const express = require('express');
const router = express.Router();
const { admin, getAuth, signOut , signInWithEmailAndPassword, createUserWithEmailAndPassword} =  require('../utils/fb');
const auth = getAuth();
const { isLoggedIn } = require('../middleware');
const catchAsync = require('../utils/catchAsync');


router.post('/register', async (req, res) => {
    const {type, email, password } = req.body;
    if(type == "user"){
        await createUserWithEmailAndPassword (auth, email, password)
        .then((regularUser) => {
            var user = regularUser.user;
            req.flash('success', 'アカウントが作成されました。ログインしてください！');
          })
          .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
          });

    }else{
        await admin.auth()
        .createUser({
            email: email,
            emailVerified: false,
            password: password,
            disabled: false,
          })
          .then((adminUser) => {
            admin.auth()
            .setCustomUserClaims(adminUser.uid, { admin: true })
            .then(() => {
                req.flash('success', 'アカウントが作成されました。ログインしてください！');
            });
          })
          .catch((error) => {
            console.log('Error creating new user:', error);
          });

    }
    res.redirect('/userlist')
});


router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login' , async (req, res) => {
    const {type, email, password } = req.body;
    let redirectUrl = req.session.returnTo || '/products';
    let mes = 'ログインに成功しました！'
    if(type == "admin"){
        mes = 'Adminログインに成功しました！'
        redirectUrl = "/userlist"
    }
    try {
        const auth = getAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        if (userCredential) {
            req.session.currentUser = { email }; // Store user's email in the session
            req.flash('success', mes);
            delete req.session.returnTo;
            return res.redirect(redirectUrl);
        } else {
            req.flash('error', 'このemailはまだ登録されていません');
            return res.redirect('/login');
        }
    } catch (error) {
        console.error('Login error:', error.message);
        req.flash('error', 'このemailはまだ登録されていません');
        return res.redirect('/login');
    }
      
});


router.get('/userList', isLoggedIn, async (req, res) => {
    // 全てのユーザーを取得する
    const listAllUsers = async () => {
        const allUsers = [];
        try {
            const listUsersResult = await admin.auth().listUsers(1000);
            listUsersResult.users.forEach((userRecord) => {
                allUsers.push(userRecord.toJSON());
            });
        } catch (error) {
            console.error('Error listing users:', error);
        }
        return allUsers;
    };
        // 全てのユーザーを取得する
        const users = await listAllUsers();          
        res.render('users/userlist', { users });
});

//to update a user
router.post('/users/:id',isLoggedIn ,catchAsync(async (req, res) => {
    const { id } = req.params;
    const {type, email, password } = req.body;

    let updateData = {
        email: email,
        disabled: false,
        emailVerified: false,
    }
    if(password){
        updateData["password"] = password
    }
    await admin.auth()
    .updateUser(id,updateData)
    .then((adminUser) => {
        let isAdmin = false
        if(type =="admin"){

            isAdmin = true
        }
        admin.auth()
        .setCustomUserClaims(adminUser.uid, { admin: isAdmin })
        .then(() => {
            req.flash('success', 'アカウントが更新されました');
        });
    })
    .then(() => {
        res.redirect('/userlist')
      })
      .catch((error) => {
        console.log('Error update user:', error);
      });

}));

router.get('/logout', async (req, res) => {
    await signOut(auth);  
    delete req.session.currentUser; 
    res.redirect('/login'); 


});

//to delete a user
router.delete('/users/:id',isLoggedIn ,catchAsync(async (req, res) => {
    const { id } = req.params;
    await admin.auth()
    .deleteUser(id)
    .then(() => {
        res.redirect('/userlist')
      })
      .catch((error) => {
        console.log('Error deleting user:', error);
      });

}));


module.exports = router;