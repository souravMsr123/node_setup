module.exports = function(profile) {
	var profileContainer = {
		"local" : {
			FCM_SERVER_KEY:'AAAAgbbcJnk:APA91bHrPcbWoia6Y5Atr6N2hN_b3qAgDvDAeGhqeCdC2VF3UiuX4afaDGlPTe7DKIS_Dg7g9iMtExU3PkB18aQhyoRTNs71ToPHIyRow1v_XQi7bS4XjG7mM8tNdyCTEq5HU0ce9d6Z',
			
			//GOOGLFCM_SERVER_KEYE_API_KEY:'AIzaSyAF6Rz5ON7_5FysLYQIlFWfANmMpfOOsd0',

			DEVELOPMENT_APN_CERTI:"/certificate/Musicalchallenges_apns_dev_cert_WithoutPassPhrase.pem",
			
			DEVELOPMENT_APN_WITHOUT_PASS_PHRASE_KEY:"/certificate/Musicalchallenges_apns_dev_key_WithoutPassPhrase.pem",
			PRODUCTION_APN_CERTI:"/certificate/Musicalchallenges_apns_pro_cert_WithoutPassPhrase.pem",
			
			PRODUCTION_APN_WITHOUT_PASS_PHRASE_KEY:"/certificate/Musicalchallenges_apns_pro_key_WithoutPassPhrase.pem",
			
                }
		
	}
    // var nodemailer = require('nodemailer');

    //return function(profile) { console.log(profileContainer[profile]); return profileContainer[profile];};
    return profileContainer[profile];

}

