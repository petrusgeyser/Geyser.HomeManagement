using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Geyser.HomeManagement.Controllers
{
	public class HomeController : Controller
	{
		// GET: Home
		[Authorize]
		public ActionResult Index()
		{
			return View();
		}

		public ActionResult About()
		{
			return View();
		}

		public ActionResult ContactUs()
		{
			return View();
		}
	}
}