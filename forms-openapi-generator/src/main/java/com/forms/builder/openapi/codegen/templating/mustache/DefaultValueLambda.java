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
import org.openapitools.codegen.CodegenProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.io.Writer;
import java.util.List;
import java.util.Map;

public class DefaultValueLambda implements Mustache.Lambda {
    private final Logger LOGGER = LoggerFactory.getLogger(DefaultValueLambda.class);

    @Override
    public void execute(Template.Fragment fragment, Writer writer) throws IOException {
        CodegenProperty property = (CodegenProperty) fragment.context();
        LOGGER.debug("Context DefaultValueLambda: {}", fragment.context());
        LOGGER.debug("Decompiling DefaultValueLambda: {}", fragment.decompile());
        String content = fragment.execute();
        LOGGER.debug("DefaultValueLambda content: {}", content);

        if (content == null || content.isEmpty()) {
            LOGGER.warn("Content is null or empty. Cannot determine datatype.");
            writer.write("null");
            return;
        }
        else {
            String[] parts = content.split(":", 2);
            String datatype = parts[0];
            if (datatype == null || datatype.isEmpty()) {
                LOGGER.warn("Datatype is null or empty. Cannot determine default value.");
                writer.write("null");
                return;
            }
            datatype = datatype.trim().toLowerCase();
            String defaultValue = parts[1];
            if (defaultValue != null && !defaultValue.isEmpty()) {
                LOGGER.debug("defaultValue specified: {}", defaultValue);
                writer.write("\""+defaultValue+"\"");
                return;
            }
            else {
                LOGGER.debug("defaultValue not specified. Using datatype: {}", datatype);
                LOGGER.debug("property.isEnum: {} and allowed values {}", property.isEnum, property.allowableValues);
                if((property.isEnum || property.isEnumRef) && !property.allowableValues.isEmpty())
                {

                    List<Map<String, Object>> enumVars = (List<Map<String, Object>>) property.allowableValues.get("enumVars");
                    if (enumVars != null && !enumVars.isEmpty()) {
                        Map<String, Object> randomEnumVar = enumVars.getFirst();
                        String enumDefaultValue = (String) randomEnumVar.get("name");
                        LOGGER.debug("Using one of allowableValues: {}", enumDefaultValue);
                        writer.write("\""+enumDefaultValue+"\"");
                    }

                    return;
                }
                if (property.isString) {
                    defaultValue = "\"\""; // Default value for string
                } else if (property.isBoolean) {
                    defaultValue = "false"; // Default value for boolean
                } else if (property.isInteger || property.isLong || property.isNumber) {
                    defaultValue = "0"; // Default value for integer
                } else if (property.isFloat || property.isDouble) {
                    defaultValue = "0.0"; // Default value for float/double
                } else if (property.isArray) {
                    defaultValue = "[]"; // Default value for array
                } else if (property.isMap) {
                    defaultValue = "{}"; // Default value for object
                } else if (property.isDate || property.isDateTime) {
                    defaultValue = "new Date()";
                } else {
                    LOGGER.warn("Unknown datatype for property: {}", property);
                    defaultValue = "null";
                }
                writer.write(defaultValue);
            }

        }

    }
}
