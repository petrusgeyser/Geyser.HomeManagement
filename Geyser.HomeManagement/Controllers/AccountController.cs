using Geyser.HomeManagement.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace Geyser.HomeManagement.Controllers
{

	[Authorize]
	public class AccountController : Controller
    {
		[AllowAnonymous]
		public ActionResult Login(string returnUrl)
		{
			if (ModelState.IsValid)
			{
			}
			ViewBag.returnUrl = returnUrl;
			return View();
		}

		[HttpPost]
		[AllowAnonymous]
		[ValidateAntiForgeryToken]
		public ActionResult Login(LoginModel details, string returnUrl)
		{
			return View(details);
		}
	}
}