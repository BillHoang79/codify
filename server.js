var express = require('express');
var app = express();
var nodemailer = require('nodemailer');
var firebase = require('firebase');

//twilio account stuff
var accountSid = 'AC7ba88a6599ee96042b778acc047436fd'; 
var authToken = 'ecfd835d7a3e90d66a0cec19adb971ad'; 

//serve the files on local server
app.use(express.static(__dirname + '/'));
app.listen(process.env.PORT || 3000);

// Initialize Firebase
var config = {
apiKey: "AIzaSyCgcDx3o3v_xk7hIHlScBR2FJE5mW0a3Cs",
authDomain: "codify-afedf.firebaseapp.com",
databaseURL: "https://codify-afedf.firebaseio.com",
storageBucket: "codify-afedf.appspot.com",
};
firebase.initializeApp(config);

var rootRef = firebase.database().ref('/student');

//get student values from firebase
rootRef.on('value',function(snapshot){
    //console.log(snapshot.val());

    students = snapshot.val();
    for(var x in students){
            var student = students[x];            
            //format date correctly for when student joined
            //this will be used to determine the current week
            student.date = new Date( student.date.replace( /(\d{2})-(\d{2})-(\d{4})/, "$2/$1/$3") );
            console.log(student.date)
            //get current date
            var q = new Date();
            var m = q.getMonth();
            var d = q.getDate();
            var y = q.getFullYear();

            var curDate = new Date(y,m,d);

            var oneDay = 24*60*60*1000; // hours*minutes*seconds*milliseconds

            //get difference of days to determine which week they
            //should be on
            var diffDays = Math.round(Math.abs((curDate.getTime() - student.date.getTime())/(oneDay)));
            //access object property dynamically to get current week;
            var curWeek = "week" + Math.floor(diffDays / 7).toString();
            console.log(curWeek)

            //TESTING ONLY!!!!!!!!
            //////////////////////
            //UNCOMMENT FOR PROD
            var thisWeek = student[curWeek];

            /////////////////////////////////////
            //HARD CODED WEEK FOR TESTING ONLY!!!
            /////////////////////////////////////
            //var thisWeek = student.week3;

            //if week defined and on the end of the week (after 7 days)
            if(typeof thisWeek !== 'undefined' && (diffDays%7==0)){
                var count = 0;
                    for(var key in thisWeek){
                        if(thisWeek[key]==true || thisWeek[key].length > 0){
                            count++
                        }
                    }

                    //get the completed amount of work from student
                    //if less than or equal to 50% they get an email
                    var amtComplete = count/Object.keys(thisWeek).length;
                    if(amtComplete <= .5){

                        //create message for student
                        var message = "Hey, " + student.name + ", it looks like you may a little behind on your work. Make sure to contact your mentor "+ student.mentor + " if you are having any difficulty completing the assignments. Happy coding!"

                        var transporter = nodemailer.createTransport({
                            service: 'Gmail',
                            auth:{
                                user: 'brianjenney83@gmail.com',
                                pass: 'freestyl1'
                            }
                        });

                        // setup e-mail data with unicode symbols
                        var mailOptions = {
                            from: '"Codify" <' + student.mentoremail + '>', // sender address
                            to: '<'+student.email+'>', // list of receivers
                            subject: 'Message from Codify', // Subject line
                            text: '', // plaintext body
                            html: "<p>" + message + "</p>"// html body
                        };
                        // send mail with defined transport object
                        transporter.sendMail(mailOptions, function(error, info){
                            if(error){
                                return console.log('Error:' + error);
                            }
                            console.log('Message sent: ' + info.response);
                        });
                    }
                }
        }
    })


//web service to send text
app.get('/sendtext', function(req, res){
    var client = require('twilio')(accountSid, authToken); 
    client.messages.create({ 
        to: "'" + req.query.to + "'", 
        from: "6504667925", 
        body: req.query.message,   
    }, function(err, message) { 
        console.log(err); 
    });
})

//TODO: need to remove, unless Matt wants to use...
//web service to send email to students on sign up
app.get('/sendmail', function(req, res){
	var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth:{
        user: 'brianjenney83@gmail.com',
        pass: 'freestyl1'
        }
    });
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: '"Codify" <' + req.query.from + '>', // sender address
        to: '<'+req.query.to+'>', // list of receivers
        subject: 'Message from Codify', // Subject line
        text: '', // plaintext body
        html: "<p>" + req.query.message + "</p>"// html body
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log('Error:' + error);
        }
        console.log('Message sent: ' + info.response);
    });
})
