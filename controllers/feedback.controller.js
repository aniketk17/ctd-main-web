const { sendEmail4 } = require('../utils/email.util.js');
const feedbackMail = async(req,res)=>{
    const {firstName, lastName, message, senderEmail} = req.body;
    if(!firstName || !lastName || !message || !senderEmail) {
        res.status(400).json({message: "All fields are required."})
    }
    try{
        await sendEmail4(firstName, lastName, senderEmail, message);
        return res.status(200).json({ message: "feedback sent successfully."})
    }
    catch(error) {
        // console.log("error:", error);
        return res.status(500).json({ message: "server error"});
    }
}

module.exports = { feedbackMail }
