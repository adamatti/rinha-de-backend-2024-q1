package adamatti.view;

import adamatti.model.Client;
import adamatti.repository.ClientRepository;
import adamatti.repository.TransactionRepository;
import adamatti.view.dto.ErrorResponse;
import adamatti.view.dto.ExtratoResponse;
import adamatti.view.dto.TransactionRequest;
import adamatti.view.dto.TransactionResponse;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Body;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;
import io.micronaut.http.annotation.Post;
import io.micronaut.transaction.annotation.Transactional;
import io.micronaut.validation.Validated;
import jakarta.validation.Valid;

import java.util.Optional;

@Controller("/clientes/{id}/transacoes")
public class TransactionController {
    private final ClientRepository clientRepository;
    private final TransactionRepository transactionRepository;
    public TransactionController(
            ClientRepository clientRepository,
            TransactionRepository transactionRepository
    ) {
        this.clientRepository = clientRepository;
        this.transactionRepository = transactionRepository;
    }

    @Post(produces = MediaType.APPLICATION_JSON)
    @Transactional
    public HttpResponse<Object> get(int id, @Valid @Body TransactionRequest body) {
        if (Math.round(body.getValor())!= body.getValor()) {
            return HttpResponse.badRequest().body("invalid float value");
        }
        Optional<Client> clientResult = clientRepository.findById(id);
        if (clientResult.isEmpty()) {
            return HttpResponse.notFound();
        }

        Client client = clientResult.get();


        int value = Math.round(body.getTipo().equals("c") ? body.getValor() : -body.getValor());

        if (
                body.getTipo().equals("d") &&
                client.getBalance() -body.getValor() <-client.getLimit()
        ) {
            return HttpResponse.unprocessableEntity().body(
                    new ErrorResponse(
                            "No funds " + (client.getBalance() - body.getValor()),
                            client.getLimit(),
                            client.getBalance()
                    )
            );
        }

        try {
            transactionRepository.insertTransaction(value, body.getDescricao(), id);
        } catch (Throwable t ) {
            if (t.getMessage().contains("current_balance_within_limit")) {
                return HttpResponse.unprocessableEntity().body(
                    new ErrorResponse(
                            "No funds " + (client.getBalance() - body.getValor()),
                            client.getLimit(),
                            client.getBalance()
                    )
                );
            }
            return HttpResponse.serverError().body(
                new ErrorResponse(t.getMessage(), client.getLimit(), client.getBalance())
            );
        }

        TransactionResponse response = new TransactionResponse(client.getLimit(), client.getBalance() + value);
        return HttpResponse.ok().body(response);
    }
}
