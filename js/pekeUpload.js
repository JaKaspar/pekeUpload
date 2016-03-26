/*
*  PekeUpload 2.0 - jQuery plugin
*  written by Pedro Molina
*  http://www.pekebyte.com/
*
*  Original work Copyright (c) 2015 Pedro Molina (http://pekebyte.com)
*  Modified work Copyright (c) 2016 Marc Schäfers (http://schaefers.it)
*  Dual licensed under the MIT (MIT-LICENSE.txt)
*  and GPL (GPL-LICENSE.txt) licenses.
*
*  Built for jQuery library
*  http://jquery.com
*
*/
(function($) {

  var uploadCount = 0;
  $.fn.pekeUpload = function(options) {
    // default configuration properties
    var defaults = {
      dragMode: false,
      dragText: "Drag and Drop your files here",
      bootstrap: false,
      btnText: "Browse files...",
      allowedExtensions: "",
      invalidExtError: "Invalid File Type",
      maxSize: 0,
      sizeError: "Size of the file is greather than allowed",
      showPreview: true,
      showFilename: true,
      showPercent: true,
      showErrorAlerts: true,
      showRemoveButtonOnSuccess: true,
      showRemoveButtonOnError: true,
      errorOnResponse: "There has been an error uploading your file",
      onSubmit: false,
      url: "upload.php",
      data: null,
      limit: 0,
      limitError: "You have reached the limit of files that you can upload",
      onFileError: function(file, error, pos) {},
      onFileSuccess: function(file, data, pos) {},
      onFileRemove: function(file, data, pos) {}
    };
    var options = $.extend(defaults, options);
    var pekeUpload = {
      obj: $(this),
      files: [],
      uparea: null,
      container: null,
      //uploadedfiles: 0,
      hasErrors: false,
      init: function() {
        this.replacehtml();

        this.uparea.on("click", function() {
          pekeUpload.selectfiles();
        });

        ///Handle events when drag
        if (options.dragMode) {
          this.handledragevents();
        } else {
          this.handlebuttonevents();
        }
        //Dismiss all warnings
        /*$(document).on("click", ".pkwrncl", function() {
          $(this).parent("div").remove();
        });*/

        //Bind event if is on Submit
        if (options.onSubmit) {
          this.handleFormSubmission();
        }
      },
      replacehtml: function() {
        var html = null;
        switch (options.dragMode) {
          case true:
          switch (options.bootstrap) {
            case true:
            html = '<div class="well well-lg pkuparea pkdragarea" style="cursor:pointer"><h4>' + options.dragText + "</h4></div>";
            break;

            case false:
            html = '<div class="pekeupload-drag-area pkuparea pkdragarea" style="cursor:pointer"><h4>' + options.dragText + "</h4></div>";
            break;
          }
          break;

          case false:
          switch (options.bootstrap) {
            case true:
            html = '<a href="javascript:void(0)" class="btn btn-primary btn-upload pkuparea"> <i class="glyphicon glyphicon-upload"></i> ' + options.btnText + "</a>";
            break;

            case false:
            html = '<a href="javascript:void(0)" class="pekeupload-btn-file pkuparea">' + options.btnText + "</a>";
            break;
          }
          break;
        }
        this.obj.hide();
        this.uparea = $(html).insertAfter(this.obj);
        this.container = $('<div class="pekecontainer"><ul></ul></div>').insertAfter(this.uparea);
      },
      selectfiles: function() {
        this.obj.click();
      },
      handlebuttonevents: function() {
        $(pekeUpload.obj).change(function(){
          if(typeof pekeUpload.obj[0].files[0] !== "undefined") {
            pekeUpload.checkFile(pekeUpload.obj[0].files[0]);
          }
        });
      },
      handledragevents: function() {
        $(document).on("dragenter", function(e) {
          e.stopPropagation();
          e.preventDefault();
        });
        $(document).on("dragover", function(e) {
          e.stopPropagation();
          e.preventDefault();
        });
        $(document).on("drop", function(e) {
          e.stopPropagation();
          e.preventDefault();
        });
        $(pekeUpload.obj).change(function(){
          if(typeof pekeUpload.obj[0].files[0] !== "undefined") {
            pekeUpload.checkFile(pekeUpload.obj[0].files[0]);
          }
        });
        this.uparea.on("dragenter", function(e) {
          e.stopPropagation();
          e.preventDefault();
          $(this).css("border", "2px solid #0B85A1");
        });
        this.uparea.on("dragover", function(e) {
          e.stopPropagation();
          e.preventDefault();
        });
        this.uparea.on("drop", function(e) {
          $(this).css("border", "2px dotted #0B85A1");
          e.preventDefault();
          var files = e.originalEvent.dataTransfer.files;
          for (var i = 0; i < files.length; i++) {
            pekeUpload.checkFile(files[i]);
          }
        });
      },
      checkFile: function(file) {
        //this.addRow(file);
        uploadCount = uploadCount + 1;
        var pos = uploadCount;
        error = this.validateFile(file);
        if (error) {
          this.addRow(file);
          // add remove button on error, if error message not shown
          if (options.showFilename && options.showRemoveButtonOnError) {
            var filename = $('div.pkfn[rel="' + uploadCount + '"]');
            var removeButton = $('<button type="button" id="pekeUpload' + uploadCount + '" class="close">&times;</button>');
            removeButton.appendTo(filename);
            removeButton.click(function() {
              options.onFileRemove(file, null, pos);
            });
          }

          if (options.showErrorAlerts) {
            this.addWarning(error, pos);
          }
          this.hasErrors = true;
          options.onFileError(file, error, pos);
        } else {
          var fileData = new Array();
          fileData[0] = file;
          fileData[1] = pos;
          fileData[2] = false; // upload started
          fileData[3] = false; // upload finished
          this.files.push(fileData);
          if (this.files.length > options.limit && options.limit > 0) {
            //this.files.splice(this.files.length - 1, 1);
            this.addRow(file);
            if (options.showErrorAlerts) {
              this.addWarning(options.limitError, pos /*this.obj*/);
            }
            this.hasErrors = true;
            options.onFileError(file, error, pos);
          } else {
            this.addRow(file);
            if (options.onSubmit == false) {
              this.upload(fileData);
            }
          }
        }
      },
      addWarning: function(error, pos) {
        var html = null;
        switch (options.bootstrap) {
          case true:
          if (options.showFilename) {
            html = '<div class="alert alert-danger">' + error + '</div>';
          } else {
            html = '<div class="alert alert-danger"><button type="button" class="close pkwrncl" data-dismiss="alert">&times;</button> ' + error + '</div>';
          }
          break;

          case false:
          if (options.showFilename) {
            html = '<div class="alert-pekeupload">' + error + '</div>';
          } else {
            html = '<div class="alert alert-danger"><button type="button" class="close pkwrncl" data-dismiss="alert">&times;</button> ' + error + '</div>';
          }
          break;
        }
        //if (!c) {
        $('div.pkparent[rel="' + pos + '"]').append(html);;
        //var parent = $('<div class="pkparent" rel="' + uploadCount + '"></div>').append(html);
        //  this.container.append(html);
        //} else {
        //    $(html).insertBefore(c);
        //}
      },
      validateFile: function(file) {
        if (!this.checkExtension(file)) {
          return options.invalidExtError;
        }
        if (!this.checkSize(file)) {
          return options.sizeError;
        }
        return null;
      },
      checkExtension: function(file) {
        if (options.allowedExtensions == "") {
          return true;
        }
        var ext = file.name.split(".").pop().toLowerCase();
        var allowed = options.allowedExtensions.split("|");
        if ($.inArray(ext, allowed) == -1) {
          return false;
        } else {
          return true;
        }
      },
      checkSize: function(file) {
        if (options.maxSize == 0) {
          return true;
        }
        try {
          if (file.size > options.maxSize) {
            return false;
          } else {
            return true;
          }
        } catch (err) {
          return false;
        }
      },
      addRow: function(file) {
        //var i = this.files.length - 1;
        switch (options.bootstrap) {
          case true:
          var newParent = $('<div class="pkparent" rel="' + uploadCount + '"></div>').appendTo(this.container);
          var newRow = $('<div class="row pkrw" rel="' + uploadCount + '"></div>').appendTo(newParent);
          if (options.showPreview) {
            var prev = $('<div class="col-lg-2 col-md-2 col-xs-4"></div>').appendTo(newRow);
            this.previewFile(prev, file);
          }
          var finfo = $('<div class="col-lg-10 col-md-10 col-xs-10"></div>').appendTo(newRow);
          if (options.showFilename) {
            finfo.append('<div class="filename pkfn" rel="' + uploadCount + '>' + file.name + /*'<button type="button" id="pekeUpload' + uploadCount + '" class="close">&times;</button>' +*/ "</div>");
          }

          var progress = $('<div class="progress"><div class="pkuppbr progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="min-width: 2em;"></div></div>').appendTo(finfo);
          if (options.showPercent) {
            progress.find("div.progress-bar").text("0%");
          }
          break;

          case false:
          var newParent = $('<div class="pkparent" rel="' + uploadCount + '"></div>').appendTo(this.container);

          var newRow = $('<div class="pekerow pkrw" rel="' + uploadCount + '"></div>').appendTo(newParent);
          if (options.showPreview) {
            var prev = $('<div class="pekeitem_preview"></div>').appendTo(newRow);
            this.previewFile(prev, file);
          }
          var finfo = $('<div class="file"></div>').appendTo(newRow);
          if (options.showFilename) {
            finfo.append('<div class="filename pkfn" rel="' + uploadCount + '">' + file.name + /*'<button type="button" id="pekeUpload' + uploadCount + '" class="close">&times;</button>' +*/ "</div>");
          }

          var progress = $('<div class="progress-pekeupload"><div class="pkuppbr bar-pekeupload pekeup-progress-bar" style="min-width: 2em;width:0%"><span></span></div></div>').appendTo(finfo);
          if (options.showPercent) {
            progress.find("div.bar-pekeupload").text("0%");
          }
          break;
        }
      },
      previewFile: function(container, file) {
        var type = file.type.split("/")[0];
        switch (type) {
          case "image":
          var fileUrl = window.URL.createObjectURL(file);
          var prev = $('<img class="thumbnail" src="' + fileUrl + '" height="64" />').appendTo(container);
          break;

          case "video":
          var fileUrl = window.URL.createObjectURL(file);
          var prev = $('<video src="' + fileUrl + '" width="100%" controls></video>').appendTo(container);
          break;

          case "audio":
          var fileUrl = window.URL.createObjectURL(file);
          var prev = $('<audio src="' + fileUrl + '" width="100%" controls></audio>').appendTo(container);
          break;

          default:
          if (options.bootstrap) {
            var prev = $('<i class="glyphicon glyphicon-file"></i>').appendTo(container);
          } else {
            var prev = $('<div class="pekeupload-item-file"></div>').appendTo(container);
          }
          break;
        }
      },
      upload: function(fileData) {
        var file = fileData[0];
        var pos = fileData[1];
        fileData[2] = true;

        var formData = new FormData();
        formData.append(this.obj.attr("name"), file);
        for (var key in options.data) {
          formData.append(key, options.data[key]);
        }
        $.ajax({
          url: options.url,
          type: "POST",
          data: formData,
          dataType: "json",
          success: function(data) {
            fileData[3] = true;
            if (data == 1 || data.success == 1) {
              //pekeUpload.files[pos] = null;

              // add remove button on successfull upload
              if (options.showFilename && options.showRemoveButtonOnSuccess) {
                var filename = $('div.pkfn[rel="' + pos + '"]');
                var removeButton = $('<button type="button" id="pekeUpload' + pos + '" class="close">&times;</button>');

                removeButton.appendTo(filename);
                removeButton.click(function() {
                  options.onFileRemove(file, data, pos);
                });
              }
              console.log(file);
              console.log(data);
              options.onFileSuccess(file, data, pos);
            } else {
              //pekeUpload.files.splice(pos, 1);
              var err = null;

              if(options.errorOnResponse.length > 0) {
                err = options.errorOnResponse;
              } else if (error in data) {
                err = data.error;
              } else {
                err = "unkown error";
              }

              // add remove button on error, if error message not shown
              if (options.showFilename && options.showRemoveButtonOnError) {
                var filename = $('div.pkfn[rel="' + pos + '"]');
                var removeButton = $('<button type="button" id="pekeUpload' + pos + '" class="close">&times;</button>');

                removeButton.appendTo(filename);
                removeButton.click(function() {
                  options.onFileRemove(file, data, pos);
                });
              }

              if (options.showErrorAlerts) {
                pekeUpload.addWarning(err, /*$('div.row[rel="' + pos + '"]')*/ pos);
              }

              // update upload bar to 0
              var progressbar = $('div.pkrw[rel="' + pos + '"]').find(".pkuppbr");
              progressbar.css("width", 0 + "%");
              if (options.showPercent) {
                progressbar.text(0 + "%");
              }

              pekeUpload.hasErrors = true;
              options.onFileError(file, err, pos);
            }
          },
          error: function(xhr, ajaxOptions, thrownError) {
            pekeUpload.files.splice(pos, 1);
            if (options.showErrorAlerts) {
              pekeUpload.addWarning(thrownError, /*$('div.pkrw[rel="' + pos + '"]')*/ pos);
            }
            pekeUpload.hasErrors = true;
            options.onFileError(file, thrownError, pos);
            //$('div.pkrw[rel="' + pos + '"]').remove();
          },
          xhr: function() {
            myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
              myXhr.upload.addEventListener("progress", function(e) {
                pekeUpload.handleProgress(e, pos);
              }, false);
            }
            return myXhr;
          },
          cache: false,
          contentType: false,
          processData: false
        });
      },
      handleProgress: function(e, pos) {
        if (e.lengthComputable) {
          var total = e.total;
          var loaded = e.loaded;
          var percent = Number((e.loaded * 100 / e.total).toFixed(2));
          var progressbar = $('div.pkrw[rel="' + pos + '"]').find(".pkuppbr");
          progressbar.css("width", percent + "%");
          if (options.showPercent) {
            progressbar.text(percent + "%");
          }
        }
      },
      handleFormSubmission: function() {
        var form = this.obj.parent("form");
        form.submit(function() {
          pekeUpload.hasErrors = false;

          var countUploadFinished = 0;
          for (var i = 0; i < pekeUpload.files.length; i++) {

            if (pekeUpload.files[i] && pekeUpload.files[i][2] == false) {
              pekeUpload.upload(pekeUpload.files[i]);
            }

            // upload is not finshed
            if(pekeUpload.files[i][3] == false || pekeUpload.files[i][2] == false) {
              countUploadFinished++;
            }
          }
          if(countUploadFinished == 0) {
            return true;
          } else {
            return false;
          }
        });
      }
    };
    pekeUpload.init();
  };
})(jQuery);
