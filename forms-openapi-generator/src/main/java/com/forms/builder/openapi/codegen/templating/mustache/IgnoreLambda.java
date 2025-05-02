package com.forms.builder.openapi.codegen.templating.mustache;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;
import org.openapitools.codegen.CodegenProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.Writer;

public class IgnoreLambda implements Mustache.Lambda {

    private final Logger LOGGER = LoggerFactory.getLogger(IgnoreLambda.class);

    @Override
    public void execute(Template.Fragment fragment, Writer writer) throws IOException {
        String content = fragment.execute();
        LOGGER.info("IgnoreLambda content: {}", content);
        String[] parts = content.split(":", 2);
        if (parts.length < 2) {
            return;
        }
        CodegenProperty property = (CodegenProperty) fragment.context();
        String propertyName = property.name;
        writer.write("");
    }
}
