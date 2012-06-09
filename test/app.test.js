
var should = require('should'),
	app = require('../app'),
	express = require('express');

module.exports = {

  'test start-up': function(){
		should.exist(app);
    app.should.be.an.instanceof(express.HTTPServer);

    app.close();
  }

};