/*
 * Copyright 2018 OpenAPI-Generator Contributors (https://openapi-generator.tech)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.forms.builder.openapi.codegen.templating.mustache;

import com.samskivert.mustache.Mustache;
import com.samskivert.mustache.Template;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.Writer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * The ExtractLambda class implements the Mustache.Lambda interface for handling
 * the processing of template fragments. It enables dynamic extraction and transformation
 * of data during template processing using regular expressions applied to specific input.
 *
 * This class processes the content between specific Mustache tags (e.g., {{#replaceAll}} and {{/replaceAll}})
 * and applies extraction logic using regular expressions.
 *
 * Expected format of the fragment content: input:regex
 * where:
 * - input: The string to be processed.
 * - regex: The dynamic regular expression pattern to apply on the input.
 *
 * If the input and regex do not contain the required information, the content is written as-is.
 */
public class ExtractLambda implements Mustache.Lambda {
    private final Logger LOGGER = LoggerFactory.getLogger(ExtractLambda.class);

    @Override
    public void execute(Template.Fragment fragment, Writer writer) throws IOException {
        //LOGGER.info("Context ExtractLambda: {}", fragment.context());
        //LOGGER.info("Decompiling ExtractLambda: {}", fragment.decompile());
        String content = fragment.execute();
        //LOGGER.info("ExtractLambda content: {}", content);

        // Split the fragment content to extract input, regex, and replacement strings
        // Format: input:regex:replacement
        String[] parts = content.split(":", 2);

        if (parts.length < 2) {
            // Not enough parameters passed; write as-is
            LOGGER.warn("Not enough parameters passed; write as-is: {}", content);
            writer.write(content);
            return;
        }

        String input = parts[0];       // The string to process
        String regex = parts[1];       // The dynamic regex pattern
        Pattern pattern = Pattern.compile(regex);
        Matcher matcher = pattern.matcher(input);
        //LOGGER.info("Extracting data type: input={}, regex={}", input, regex);
        String extracted = "";
        if (matcher.find()) {
            extracted = matcher.group(1);
        }

        writer.write(extracted);
        //LOGGER.info("Regex extraction complete - {}", extracted);

    }
}
