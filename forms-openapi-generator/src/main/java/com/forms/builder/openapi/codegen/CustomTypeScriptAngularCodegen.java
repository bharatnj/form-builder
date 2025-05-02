package com.forms.builder.openapi.codegen;

import com.forms.builder.openapi.codegen.templating.mustache.CompareLambda;
import com.forms.builder.openapi.codegen.templating.mustache.DefaultValueLambda;
import com.forms.builder.openapi.codegen.templating.mustache.ExtractLambda;
import com.forms.builder.openapi.codegen.templating.mustache.IgnoreLambda;
import com.google.common.collect.ImmutableMap;
import com.samskivert.mustache.Mustache;
import org.openapitools.codegen.CodegenConfig;
import org.openapitools.codegen.CodegenType;
import org.openapitools.codegen.languages.TypeScriptAngularClientCodegen;
import org.openapitools.codegen.meta.GeneratorMetadata;
import org.openapitools.codegen.meta.Stability;

public class CustomTypeScriptAngularCodegen extends TypeScriptAngularClientCodegen implements CodegenConfig {
    public CustomTypeScriptAngularCodegen() {
        super();
        this.additionalProperties.put("extract", new ExtractLambda());
        this.additionalProperties.put("compare", new CompareLambda());
        this.additionalProperties.put("default-value", new DefaultValueLambda());
        this.additionalProperties.put("ignore", new IgnoreLambda());
        // Register with the name "custom-typescript-angular"
        this.generatorMetadata = GeneratorMetadata.newBuilder()
                .stability(Stability.STABLE)
                .build();

        //outputFolder = "generated-code/typescript-angular";
        //embeddedTemplateDir = templateDir = "typescript-angular";
    }

    /**
     * Configures the type of generator.
     *
     * @return  the CodegenType for this generator
     * @see     org.openapitools.codegen.CodegenType
     */
    public CodegenType getTag() {
        return CodegenType.SCHEMA;
    }

    /**
     * Configures a friendly name for the generator.  This will be used by the generator
     * to select the library with the -g flag.
     *
     * @return the friendly name for the generator
     */
    @Override
    public String getName() {
        return "custom-typescript-angular";
    }


    @Override
    protected ImmutableMap.Builder<String, Mustache.Lambda> addMustacheLambdas() {
        return super.addMustacheLambdas()
                .put("extract", new ExtractLambda())
                .put("compare", new CompareLambda())
                .put("default-value", new DefaultValueLambda())
                .put("ignore", new IgnoreLambda());
    }

}
