using Geyser.HomeManagement.Models;
using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.EntityFramework;
using Microsoft.AspNet.Identity.Owin;
using Microsoft.Owin;

namespace Geyser.HomeManagement.Infrastructure
{
	public class AppUserManager : UserManager<AppUser>
	{
		public AppUserManager(IUserStore<AppUser> store) : base(store)
		{
		}
		public static AppUserManager Create(IdentityFactoryOptions<AppUserManager> options, IOwinContext context)
		{
			AppIdentityDbContext db = context.Get<AppIdentityDbContext>();
			AppUserManager manager = new AppUserManager(new UserStore<AppUser>(db));
			manager.PasswordValidator = new PasswordValidator
			{
				RequiredLength = 6,
				RequireNonLetterOrDigit = false,
				RequireDigit = false,
				RequireLowercase = true,
				RequireUppercase = true
			};
			return manager;
		}
	}
}