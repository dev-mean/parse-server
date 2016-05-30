UploaderLogo = Backbone.View.extend({
  events: {
    "submit": "upload",
    "change input[type=file]": "upload",
    "click .upload": "showFile"
  },
  
  initialize: function() {
    var self = this;
    this.fileUploadControl = this.$el.find("input[type=file]")[0];
  },

  showFile: function(e) {
    this.fileUploadControl.click();
    return false;
  },

  upload: function() {
    var self = this;
    if(self.$('#chkLogo').is(':checked'))
    if (this.fileUploadControl.files.length > 0) {
      this.$(".upload").html("Uploading....");
      var file = this.fileUploadControl.files[0];
      var name =file.name;
      var parseFile = new Parse.File(name, file);

      // First, we save the file using the javascript sdk
      parseFile.save().then(function() {
        // Then, we post to our custom endpoint which will do the post
        // processing necessary for the image page
		var AluminumL;
        if(self.$('#Aluminum').is(':checked'))
			AluminumL='x';
		var CardboardL;
        if(self.$('#Cardboard').is(':checked'))
			CardboardL='x';
		var ConstructionDebrisL;
        if(self.$('#ConstructionDebris').is(':checked'))
			ConstructionDebrisL='x';
		var CopperL;
        if(self.$('#Copper').is(':checked'))
			CopperL='x';
		var ElectronicsL;
        if(self.$('#Electronics').is(':checked'))
			ElectronicsL='x';
		var FerrousMetalsL;
        if(self.$('#FerrousMetals').is(':checked'))
			FerrousMetalsL='x';
		var GlassL;
        if(self.$('#Glass').is(':checked'))
			GlassL='x';
		var GlycolsL;
        if(self.$('#Glycols').is(':checked'))
			GlycolsL='x';
		var HHWL;
        if(self.$('#HHW').is(':checked'))
			HHWL='x';
		var NonFerrousMetalsL;
        if(self.$('#NonFerrousMetals').is(':checked'))
			NonFerrousMetalsL='x';
		var PaperL;
        if(self.$('#Paper').is(':checked'))
			PaperL='x';
		var Plastic1and2L;
        if(self.$('#Plastic1and2').is(':checked'))
			Plastic1and2L='x';
		var SteelcansL;
        if(self.$('#Steelcans').is(':checked'))
			SteelcansL='x';
		var StretchyPlasticL;
        if(self.$('#StretchyPlastic').is(':checked'))
			StretchyPlasticL='x';
		var UsedOilL;
        if(self.$('#UsedOil').is(':checked'))
			UsedOilL='x';
	var payLoad=	{
          file: {
            "__type": "File",
            "url": parseFile.url(),
            "name": parseFile.name()
          },
	  
Aluminum: AluminumL,
Cardboard: CardboardL,
CompanyName: self.$("#CompanyName").val(),
ConstructionDebris: ConstructionDebrisL,
Copper: CopperL,
Electronics: ElectronicsL,
FerrousMetals: FerrousMetalsL,
Glass: GlassL,
Glycols: GlycolsL,
HHW: HHWL,
Latitude: self.$("#Latitude").val(),
Longitude: self.$("#Longitude").val(),
NonFerrousMetals: NonFerrousMetalsL,
Paper: PaperL,
PhoneNumber: self.$("#PhoneNumber").val(),
Plastic1and2: Plastic1and2L,
Steelcans: SteelcansL,
StretchyPlastic: StretchyPlasticL,
UsedOil: UsedOilL,
WEBSITES: self.$("#WEBSITES").val()
        };
	if(self.$("[name=objectId]").val()=="0")
	{
		
		$.post("/GSACompanies",payLoad , function(data) {
          window.location.reload();
        });
	}
	else
	{
	$.post("/GSACompanies/"+self.$("[name=objectId]").val(), payLoad, function(data) {
        window.location.reload();
        });
	}
      });
    } else {
      alert("Please select a file");
    }

    return false;
  }
});
UploaderImage = Backbone.View.extend({
  events: {
    "submit": "upload",
    "change input[type=file]": "upload",
    "click .upload": "showFile"
  },
  
  initialize: function() {
    var self = this;
    this.fileUploadControl = this.$el.find("input[type=file]")[0];
  },

  showFile: function(e) {
    this.fileUploadControl.click();
    return false;
  },

  upload: function() {
    var self = this;
    
    if (this.fileUploadControl.files.length > 0) {
      this.$(".upload").html("Uploading.....");
      var file = this.fileUploadControl.files[0];
	  
      var name =file.name;
	  
      var parseFile = new Parse.File(name, file);

      // First, we save the file using the javascript sdk
      parseFile.save().then(function() {
        // Then, we post to our custom endpoint which will do the post
        // processing necessary for the image page
		
	var payLoad=	{
          file: {
            "__type": "File",
            "url": parseFile.url(),
            "name": parseFile.name()
          },
WebLink: self.$("#WebLink").val()
        };
		console.log(payLoad);
	if(self.$("[name=objectId]").val()=="0")
	{
		
		$.post("/GSAMarketingBanners",payLoad , function(data) {
          window.location.reload();
        });
	}
	else
	{
	$.post("/GSAMarketingBanners/"+self.$("[name=objectId]").val(), payLoad, function(data) {
        window.location.reload();
        });
	}
      });
    } else {
      alert("Please select a file");
    }

    return false;
  }
});
$("a[data-action='post']").click(function(e) {
    var el = $(e.target);
    el.closest("form").submit();
    return false;
  });
