using Geyser.HomeManagement.Infrastructure;
using Geyser.HomeManagement.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;

namespace Geyser.HomeManagement.Controllers
{
	public class AdminController : Controller
    {
		public ActionResult Index()
		{
			return View(UserManager.Users);
		}
		private AppUserManager UserManager
		{
			get
			{
				return HttpContext.GetOwinContext().GetUserManager<AppUserManager>();
			}
		}

		public ActionResult Create()
		{
			return View();
		}

		[HttpPost]
		public async Task<ActionResult> Create(CreateModel model)
		{
			if (ModelState.IsValid)
			{
				AppUser user = new AppUser { UserName = model.Name, Email = model.Email };
				IdentityResult result = await UserManager.CreateAsync(user, model.Password);
				
				if (result.Succeeded)
				{
					return RedirectToAction("Index");
				}
				else
				{
					AddErrorsFromResult(result);
				}
			}
			return View(model);
		}

		private void AddErrorsFromResult(IdentityResult result)
		{
			foreach (string error in result.Errors)
			{
				ModelState.AddModelError("", error);
			}
		}

		[HttpPost]
		public async Task<ActionResult> Delete(string id)
		{
			AppUser user = await UserManager.FindByIdAsync(id);
			if (user != null)
			{
				IdentityResult result = await UserManager.DeleteAsync(user);
				if (result.Succeeded)
				{
					return RedirectToAction("Index");
				}
				else
				{
					return View("Error", result.Errors);
				}
			}
			else
			{
				return View("Error", new string[] { "User Not Found" });
			}
		}

		public async Task<ActionResult> Edit(string id)
		{
			AppUser user = await UserManager.FindByIdAsync(id);
			if (user != null)
			{
				return View(user);
			}
			else
			{
				return RedirectToAction("Index");
			}
		}

		[HttpPost]
		public async Task<ActionResult> Edit(string id, string email, string password)
		{
			AppUser user = await UserManager.FindByIdAsync(id);
			if (user != null)
			{
				user.Email = email;
				IdentityResult validEmail = await UserManager.UserValidator.ValidateAsync(user);
				if (!validEmail.Succeeded)
				{
					AddErrorsFromResult(validEmail);
				}
				IdentityResult validPass = null;
				if (password != string.Empty)
				{
					validPass = await UserManager.PasswordValidator.ValidateAsync(password);
					if (validPass.Succeeded)
					{
						user.PasswordHash = UserManager.PasswordHasher.HashPassword(password);
					}
					else
					{
						AddErrorsFromResult(validPass);
					}
				}
				if ((validEmail.Succeeded && validPass == null) || (validEmail.Succeeded && password != string.Empty && validPass.Succeeded))
				{
					IdentityResult result = await UserManager.UpdateAsync(user);
					if (result.Succeeded)
					{
						return RedirectToAction("Index");
					}
					else
					{
						AddErrorsFromResult(result);
					}
				}
			}
			else
			{
				ModelState.AddModelError("", "User Not Found");
			}
			return View(user);
		}
	}
}