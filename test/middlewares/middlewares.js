
class Middlewares {

	constructor() {
	}

	sessionUser(req, res, next){
		if(!req.session.user){
			res.redirect('/login');
		} else {
			next();
		}
	}

  }

module.exports = new Middlewares();