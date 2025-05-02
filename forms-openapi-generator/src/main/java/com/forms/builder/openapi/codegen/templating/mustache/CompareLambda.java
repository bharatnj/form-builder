package com.forms.builder.openapi.codegen.templating.mustache;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.Writer;

public class CompareLambda implements Mustache.Lambda {

    private final Logger LOGGER = LoggerFactory.getLogger(CompareLambda.class);

    @Override
    public void execute(Template.Fragment fragment, Writer writer) throws IOException {
        //LOGGER.info("Context CompareLambda: {}", fragment.context());
        //LOGGER.info("Decompiling CompareLambda: {}", fragment.decompile());
        String content = fragment.execute();
        //LOGGER.info("CompareLambda content: {}", content);

        String[] parts = content.split(":", 3);

        if (parts.length < 3) {
            // Not enough parameters passed; write as-is
            LOGGER.warn("Not enough parameters passed; write as-is: {}", content);
            writer.write(content);
            return;
        }

        String input = parts[0];
        String compareTo = parts[1];
        String replacement = parts[2];
        if (input.equals(compareTo)) {
            writer.write(replacement);
        }

    }
}
