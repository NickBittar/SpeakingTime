using Microsoft.AspNetCore.Razor.TagHelpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SpeakingTime.TagHelpers
{
    public class LocalDateTimeStringTagHelper : TagHelper
    {
        public DateTime? DateTime { get; set; }
        public override void Process(TagHelperContext context, TagHelperOutput output)
        {
            string htmlContent = "";
            if (DateTime.HasValue)
            {
                output.TagName = "script";
                htmlContent = "(function(){let date=new Date('" + DateTime.Value.ToString("u") + "');document.write(date.toLocaleString());})();";
            } 
            else
            {
                output.TagName = null;
            }
            output.Content.SetHtmlContent(htmlContent);
        }
    }
}
