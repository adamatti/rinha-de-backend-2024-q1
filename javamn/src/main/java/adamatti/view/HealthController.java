package adamatti.view;

import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;

@Controller("/")
public class HealthController {
    @Get(produces = MediaType.APPLICATION_JSON)
    public String index() {
        return "Hello World";
    }
}
