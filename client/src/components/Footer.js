import React from "react";
import EmailIcon from "@material-ui/icons/Email";
import FacebookIcon from "@material-ui/icons/Facebook";
import TwitterIcon from "@material-ui/icons/Twitter";
import InstagramIcon from "@material-ui/icons/Instagram";

function Footer() {
	return (
		<div className="footer_container">
			<div className="footer_sub_container">
				<p>clean.out@gmail.com</p>
				<EmailIcon className="icon" />
			</div>

			<div className="footer_sub_container">
				<p>Follow us on</p>
				<FacebookIcon className="icon" />
				<TwitterIcon className="icon" />
				<InstagramIcon className="icon" />
			</div>

			<div className="footer_sub_container">
				<p>Copyright &copy; 2021</p>
			</div>
		</div>
	);
}

export default Footer;
