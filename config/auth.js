module.exports={
    ensureAuthenticated: (req,res,next)=>{
        if(req.isAuthenticated())
        {
            return next();
        }
        req.flash('err_msg','Please Log in to view this resource');
        res.redirect('/users/login');
    }
}