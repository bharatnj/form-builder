package com.forms.builder.openapi.codegen;

import org.openapitools.codegen.*;
import org.openapitools.codegen.languages.SpringCodegen;
import org.openapitools.codegen.model.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.io.File;

public class ApiCodegen extends SpringCodegen implements CodegenConfig {
  private final Logger LOGGER = LoggerFactory.getLogger(com.forms.builder.openapi.codegen.ApiCodegen.class);

  // source folder where to write the files
  protected String sourceFolder = "src/main/generated";
  protected String apiVersion = "1.0.0";

  /**
   * Configures the type of generator.
   *
   * @return  the CodegenType for this generator
   * @see     org.openapitools.codegen.CodegenType
   */
  public CodegenType getTag() {
    return CodegenType.OTHER;
  }

  /**
   * Configures a friendly name for the generator.  This will be used by the generator
   * to select the library with the -g flag.
   *
   * @return the friendly name for the generator
   */
  public String getName() {
    return "forms-builder-api";
  }

  @Override
  public Map<String, ModelsMap> postProcessAllModels(Map<String, ModelsMap> objs) {
    objs = super.postProcessAllModels(objs);
    List<String> removeModels = new ArrayList<>();
    for (String key : objs.keySet()) {
      ModelsMap modelsAttrs = objs.get(key);
      for (ModelMap mo : modelsAttrs.getModels()) {
        CodegenModel cm = mo.getModel();
        LOGGER.info("Inside postProcessAllModels for {}", key);
        if (cm.vendorExtensions.containsKey(VendorExtension.X_CLASS_EXTRA_ANNOTATION.getName()))
        {
          LOGGER.info("Inside postProcessAllModels X_CLASS_EXTRA_ANNOTATION");
          List<String> classAnnotation = (List<String>)cm.vendorExtensions.get(VendorExtension.X_CLASS_EXTRA_ANNOTATION.getName());
          for (String annotation : classAnnotation) {
            if(annotation.contains("com.google.cloud.spring.data.firestore.Document")) {
              LOGGER.info("Inside postProcessAllModels contains firestore document");
              // Use FirestoreReactiveRepository for models with Firestore Document annotation
              cm.vendorExtensions.put("isFirestoreDocument", true);
              for(CodegenProperty var: cm.allVars)
              {
                if(var.vendorExtensions.containsKey(VendorExtension.X_FIELD_EXTRA_ANNOTATION.getName()))
                {
                  LOGGER.info("Inside postProcessAllModels X_FIELD_EXTRA_ANNOTATION");
                  List<String> fieldAnnotations = (List<String>)var.vendorExtensions.get(VendorExtension.X_FIELD_EXTRA_ANNOTATION.getName());
                  for (String fieldAnnotation : fieldAnnotations) {
                    if(fieldAnnotation.contains("org.springframework.data.annotation.Id"))
                    {
                      LOGGER.info("Inside postProcessAllModels contains spring data id for {} {}", var.name, var.dataType);
                      this.additionalProperties.put("springDataRepositoryPrimaryKeyDataType", var.dataType);
                      cm.vendorExtensions.put("springDataRepositoryPrimaryKeyDataType", var.dataType);
                    }
                  }
                }
              }
              break;
            }
            else if(annotation.contains("org.springframework.data"))
            {
              LOGGER.info("Inside postProcessAllModels contains spring data");
              String springDataRepositoryName = (String) this.additionalProperties.get("springDataRepositoryName");
              additionalProperties.put("springDataRepositoryPackageName", springDataRepositoryName.toLowerCase());
              cm.vendorExtensions.put("springDataRepositoryPackageName", springDataRepositoryName.toLowerCase());
              for(CodegenProperty var: cm.allVars)
              {
                if(var.vendorExtensions.containsKey(VendorExtension.X_FIELD_EXTRA_ANNOTATION.getName()))
                {
                  LOGGER.info("Inside postProcessAllModels X_FIELD_EXTRA_ANNOTATION");
                  List<String> fieldAnnotations = (List<String>)var.vendorExtensions.get(VendorExtension.X_FIELD_EXTRA_ANNOTATION.getName());
                  for (String fieldAnnotation : fieldAnnotations) {
                    if(fieldAnnotation.contains("org.springframework.data.annotation.Id"))
                    {
                      LOGGER.info("Inside postProcessAllModels contains spring data id for {} {}", var.name, var.dataType);
                      this.additionalProperties.put("springDataRepositoryPrimaryKeyDataType", var.dataType);
                      cm.vendorExtensions.put("springDataRepositoryPrimaryKeyDataType", var.dataType);
                    }
                  }
                }
              }
              break;
            }
            else{
              removeModels.add(key);
            }
          }
        }
        else {
          removeModels.add(key);
        }
      }
    }
    for (String key : removeModels) {
      LOGGER.info("Inside postProcessAllModels remove key {}", key);
      objs.remove(key);
    }
    return objs;
  }

  /**
   * Provides an opportunity to inspect and modify operation data before the code is generated.
   */
  @Override
  public OperationsMap postProcessOperationsWithModels(OperationsMap objs, List<ModelMap> allModels) {

    // to try debugging your code generator:
    // set a break point on the next line.
    // then debug the JUnit test called LaunchGeneratorInDebugger

    OperationsMap results = super.postProcessOperationsWithModels(objs, allModels);

    OperationMap ops = results.getOperations();
    List<CodegenOperation> opList = ops.getOperation();

    // Extract path parameters from operations and add them to the model's vendor extensions
    for (CodegenOperation co : opList) {
      if (co.pathParams != null && !co.pathParams.isEmpty()) {
        // Find the model that corresponds to this operation
        for (ModelMap modelMap : allModels) {
          CodegenModel model = modelMap.getModel();

          // Check if this operation returns or accepts this model
          boolean isRelatedToModel = false;
          if (co.returnType != null && co.returnType.contains(model.name)) {
            isRelatedToModel = true;
          } else if (co.bodyParam != null && co.bodyParam.dataType != null && co.bodyParam.dataType.contains(model.name)) {
            isRelatedToModel = true;
          }

          if (isRelatedToModel) {
            LOGGER.info("Found path parameters for model {}: {}", model.name, co.pathParams);

            // Create a map to store path parameters
            Map<String, Object> pathParams = new HashMap<>();
            pathParams.put("isList", co.returnType != null && co.returnType.startsWith("List"));
            pathParams.put("isPaginated", co.returnType != null && co.returnType.startsWith("List"));
            pathParams.put("parameters", co.pathParams);

            // Add path parameters to the model's vendor extensions
            model.vendorExtensions.put("x-path-parameters", pathParams);
          }
        }
      }
    }

    return results;
  }

  /**
   * Returns human-friendly help for the generator.  Provide the consumer with help
   * tips, parameters here
   *
   * @return A string value for the help message
   */
  public String getHelp() {
    return "Generates form builder apis.";
  }

  public ApiCodegen() {
    super();

    // set the output folder here
    outputFolder = "generated-code/forms-openapi-codegen";

    /**
     * Models.  You can write model files using the modelTemplateFiles map.
     * if you want to create one template for file, you can do so here.
     * for multiple files for model, just put another entry in the `modelTemplateFiles` with
     * a different extension
     */
    // We'll use a single template entry and select the appropriate template in postProcessModels
    modelTemplateFiles.put(
      "springDataRepository.mustache", // default template
      ".java");       // the extension for each file to write

    /**
     * Api classes.  You can write classes for each Api file with the apiTemplateFiles map.
     * as with models, add multiple entries with different extensions for multiple files per
     * class
     */
    /*apiTemplateFiles.put(
      "api.mustache",   // the template to use
      ".sample");  */     // the extension for each file to write

    /**
     * Template Location.  This is the location which templates will be read from.  The generator
     * will use the resource stream to attempt to read the templates.
     */
    templateDir = "forms-builder-api";

    /**
     * Api Package.  Optional, if needed, this can be used in templates
     */
    /*apiPackage = "com.forms.builder.api";*/

    /**
     * Model Package.  Optional, if needed, this can be used in templates
     */
    /*modelPackage = "com.forms.builder.model";*/

    /**
     * Reserved words.  Override this with reserved words specific to your language
     */
    /*reservedWords = new HashSet<String> (
      Arrays.asList(
        "sample1",  // replace with static values
        "sample2")
    );*/

    /**
     * Additional Properties.  These values can be passed to the templates and
     * are available in models, apis, and supporting files
     */
    /*additionalProperties.put("apiVersion", apiVersion);*/

    /**
     * Supporting Files.  You can write single files for the generator with the
     * entire object tree available.  If the input file has a suffix of `.mustache
     * it will be processed by the template engine.  Otherwise, it will be copied
     */
    /*supportingFiles.add(new SupportingFile("myFile.mustache",   // the input template or file
      "",                                                       // the destination folder, relative `outputFolder`
      "myFile.sample")                                          // the output file
    );*/

    /**
     * Language Specific Primitives.  These types will not trigger imports by
     * the client generator
     */
    /*languageSpecificPrimitives = new HashSet<String>(
      Arrays.asList(
        "Type1",      // replace these with your types
        "Type2")
    );*/
  }

  /**
   * Escapes a reserved word as defined in the `reservedWords` array. Handle escaping
   * those terms here.  This logic is only called if a variable matches the reserved words
   *
   * @return the escaped term
   */
  @Override
  public String escapeReservedWord(String name) {
    return "_" + name;  // add an underscore to the name
  }

  /**
   * Location to write model files.  You can use the modelPackage() as defined when the class is
   * instantiated
   */
  public String modelFileFolder() {
    return outputFolder + "/" + sourceFolder + "/" + modelPackage().replace('.', File.separatorChar);
  }

  /**
   * Location to write api files.  You can use the apiPackage() as defined when the class is
   * instantiated
   */
  @Override
  public String apiFileFolder() {
    return outputFolder + "/" + sourceFolder + "/" + apiPackage().replace('.', File.separatorChar);
  }

  /**
   * override with any special text escaping logic to handle unsafe
   * characters so as to avoid code injection
   *
   * @param input String to be cleaned up
   * @return string with unsafe characters removed or escaped
   */
  @Override
  public String escapeUnsafeCharacters(String input) {
    //TODO: check that this logic is safe to escape unsafe characters to avoid code injection
    return input;
  }

  /**
   * Escape single and/or double quote to avoid code injection
   *
   * @param input String to be cleaned up
   * @return string with quotation mark removed or escaped
   */
  public String escapeQuotationMark(String input) {
    //TODO: check that this logic is safe to escape quotation mark to avoid code injection
    return input.replace("\"", "\\\"");
  }
}
