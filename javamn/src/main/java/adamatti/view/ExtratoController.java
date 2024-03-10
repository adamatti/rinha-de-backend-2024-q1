package adamatti.view;

import adamatti.model.Client;
import adamatti.model.Transaction;
import adamatti.repository.ClientRepository;
import adamatti.repository.TransactionRepository;
import adamatti.view.dto.ExtratoResponse;
import io.micronaut.http.HttpResponse;
import io.micronaut.http.MediaType;
import io.micronaut.http.annotation.Controller;
import io.micronaut.http.annotation.Get;

import java.util.List;
import java.util.Optional;

@Controller("/clientes/{id}/extrato")
public class ExtratoController {
    private final ClientRepository clientRepository;
    private final TransactionRepository transactionRepository;
    public ExtratoController(
            ClientRepository clientRepository,
            TransactionRepository transactionRepository
    ) {
        this.clientRepository = clientRepository;
        this.transactionRepository = transactionRepository;
    }

    @Get(produces = MediaType.APPLICATION_JSON)
    public HttpResponse<ExtratoResponse> get(int id) {
        Optional<Client> clientResult = clientRepository.findById(id);
        if (clientResult.isEmpty()) {
            return HttpResponse.notFound();
        }

        Client client = clientResult.get();
        List<Transaction> transactions = transactionRepository.lastTransactions(id);

        ExtratoResponse response = new ExtratoResponse(client, transactions);
        return HttpResponse.ok().body(response);
    }
}
