// Sistema de Pagamentos
class PaymentSystem {
    constructor() {
        this.providers = {
            stripe: {
                enabled: false,
                publicKey: localStorage.getItem('stripe_public_key') || '',
                secretKey: localStorage.getItem('stripe_secret_key') || ''
            },
            mercadopago: {
                enabled: false,
                publicKey: localStorage.getItem('mp_public_key') || '',
                accessToken: localStorage.getItem('mp_access_token') || ''
            },
            paypal: {
                enabled: false,
                clientId: localStorage.getItem('paypal_client_id') || ''
            }
        };
        this.transactions = [];
        this.init();
    }

    init() {
        this.loadTransactions();
        this.setupPaymentListeners();
    }

    loadTransactions() {
        this.transactions = JSON.parse(localStorage.getItem('transactions') || '[]');
    }

    async processPayment(eventId, userId, amount, method = 'stripe') {
        const transaction = {
            id: this.generateTransactionId(),
            eventId,
            userId,
            amount,
            method,
            status: 'pending',
            createdAt: new Date(),
            metadata: {}
        };

        try {
            // Simular processamento de pagamento
            const result = await this.simulatePaymentProcessing(transaction);
            
            if (result.success) {
                transaction.status = 'completed';
                transaction.completedAt = new Date();
                transaction.transactionReference = result.reference;
                
                // Confirmar inscrição após pagamento
                this.confirmEnrollmentAfterPayment(eventId, userId);
                
                showNotificationToast('Pagamento realizado com sucesso!', 'success');
            } else {
                transaction.status = 'failed';
                transaction.error = result.error;
                showNotificationToast('Falha no pagamento. Tente novamente.', 'error');
            }
        } catch (error) {
            transaction.status = 'failed';
            transaction.error = error.message;
            console.error('Erro no pagamento:', error);
        }

        this.transactions.push(transaction);
        this.saveTransactions();
        return transaction;
    }

    async simulatePaymentProcessing(transaction) {
        // Simular API de pagamento (em produção, integraria com Stripe/MP real)
        return new Promise((resolve) => {
            setTimeout(() => {
                const success = Math.random() > 0.1; // 90% de sucesso
                resolve({
                    success,
                    reference: success ? `TXN-${Date.now()}` : null,
                    error: success ? null : 'Cartão recusado'
                });
            }, 2000);
        });
    }

    confirmEnrollmentAfterPayment(eventId, userId) {
        const enrollments = JSON.parse(localStorage.getItem('enrollments') || '[]');
        const enrollment = enrollments.find(e => e.eventId === eventId && e.userId === userId);
        
        if (enrollment) {
            enrollment.paymentStatus = 'paid';
            enrollment.confirmedAt = new Date();
            localStorage.setItem('enrollments', JSON.stringify(enrollments));
            
            // Enviar e-mail de confirmação
            if (window.emailSystem) {
                window.emailSystem.sendConfirmationEmail(userId, eventId);
            }
        }
    }

    renderPaymentForm(eventId, amount) {
        return `
            <div class="payment-form">
                <h3>💳 Pagamento do Evento</h3>
                <div class="payment-amount">
                    <span>Total:</span>
                    <strong>R$ ${amount.toFixed(2)}</strong>
                </div>
                
                <div class="payment-methods">
                    <button class="payment-method" data-method="credit-card">
                        <i class="fas fa-credit-card"></i>
                        Cartão de Crédito
                    </button>
                    <button class="payment-method" data-method="pix">
                        <i class="fas fa-qrcode"></i>
                        PIX
                    </button>
                    <button class="payment-method" data-method="boleto">
                        <i class="fas fa-barcode"></i>
                        Boleto
                    </button>
                </div>

                <div id="payment-details" class="payment-details"></div>
                
                <button class="btn btn-primary btn-pay" disabled>
                    Realizar Pagamento
                </button>
            </div>
        `;
    }

    setupPaymentListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.payment-method')) {
                const method = e.target.closest('.payment-method').dataset.method;
                this.showPaymentDetails(method);
            }

            if (e.target.closest('.btn-pay')) {
                this.handlePayment();
            }
        });
    }

    showPaymentDetails(method) {
        const detailsContainer = document.getElementById('payment-details');
        const payButton = document.querySelector('.btn-pay');
        
        if (!detailsContainer) return;

        let html = '';

        switch (method) {
            case 'credit-card':
                html = `
                    <div class="card-form">
                        <div class="form-group">
                            <label>Número do Cartão</label>
                            <input type="text" id="card-number" placeholder="0000 0000 0000 0000" maxlength="19">
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Validade</label>
                                <input type="text" id="card-expiry" placeholder="MM/AA" maxlength="5">
                            </div>
                            <div class="form-group">
                                <label>CVV</label>
                                <input type="text" id="card-cvv" placeholder="123" maxlength="4">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Nome no Cartão</label>
                            <input type="text" id="card-name" placeholder="Como impresso no cartão">
                        </div>
                    </div>
                `;
                break;

            case 'pix':
                html = `
                    <div class="pix-payment">
                        <p>Escaneie o QR Code abaixo com o app do seu banco:</p>
                        <div class="qr-code-container">
                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PIX-${Date.now()}" alt="QR Code PIX">
                        </div>
                        <p>Ou copie o código PIX:</p>
                        <div class="pix-code">
                            <input type="text" value="00020126580014BR.GOV.BCB.PIX..." readonly>
                            <button class="btn-copy-pix">Copiar</button>
                        </div>
                        <p class="text-muted">Pagamento confirmado automaticamente</p>
                    </div>
                `;
                break;

            case 'boleto':
                html = `
                    <div class="boleto-payment">
                        <p>Seu boleto será gerado após a confirmação</p>
                        <div class="boleto-info">
                            <p>📅 Vencimento: ${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}</p>
                            <p>⏰ Pagamento confirmado em até 2 dias úteis</p>
                        </div>
                    </div>
                `;
                break;
        }

        detailsContainer.innerHTML = html;
        payButton.disabled = false;
    }

    async handlePayment() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const eventId = document.querySelector('[data-event-id]')?.dataset.eventId;
        const amount = parseFloat(document.querySelector('.payment-amount strong')?.textContent.replace('R$ ', '') || '0');

        if (!currentUser.id || !eventId) {
            showNotificationToast('Erro ao processar pagamento', 'error');
            return;
        }

        const payButton = document.querySelector('.btn-pay');
        payButton.disabled = true;
        payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processando...';

        const result = await this.processPayment(eventId, currentUser.id, amount);

        if (result.status === 'completed') {
            this.showPaymentSuccess(result);
        } else {
            this.showPaymentError(result);
        }

        payButton.disabled = false;
        payButton.innerHTML = 'Realizar Pagamento';
    }

    showPaymentSuccess(transaction) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content payment-success">
                <div class="success-icon">✅</div>
                <h2>Pagamento Realizado!</h2>
                <p>Sua inscrição foi confirmada com sucesso.</p>
                <div class="transaction-details">
                    <p><strong>ID da Transação:</strong> ${transaction.transactionReference}</p>
                    <p><strong>Valor:</strong> R$ ${transaction.amount.toFixed(2)}</p>
                    <p><strong>Data:</strong> ${new Date(transaction.completedAt).toLocaleString('pt-BR')}</p>
                </div>
                <button class="btn btn-primary" onclick="this.closest('.modal').remove()">OK</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    showPaymentError(transaction) {
        showNotificationToast(`Erro: ${transaction.error}`, 'error');
    }

    generateTransactionId() {
        return 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    saveTransactions() {
        localStorage.setItem('transactions', JSON.stringify(this.transactions));
    }

    // Relatórios financeiros
    getFinancialReport(startDate, endDate) {
        const filtered = this.transactions.filter(t => {
            const date = new Date(t.createdAt);
            return t.status === 'completed' && date >= startDate && date <= endDate;
        });

        return {
            totalTransactions: filtered.length,
            totalRevenue: filtered.reduce((sum, t) => sum + t.amount, 0),
            byMethod: filtered.reduce((acc, t) => {
                acc[t.method] = (acc[t.method] || 0) + t.amount;
                return acc;
            }, {}),
            byEvent: filtered.reduce((acc, t) => {
                acc[t.eventId] = (acc[t.eventId] || 0) + t.amount;
                return acc;
            }, {})
        };
    }

    exportTransactions() {
        const csv = ['ID,Evento,Usuário,Valor,Método,Status,Data'].concat(
            this.transactions.map(t => 
                `${t.id},${t.eventId},${t.userId},${t.amount},${t.method},${t.status},${t.createdAt}`
            )
        ).join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'transacoes.csv';
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Inicializar
let paymentSystem;
document.addEventListener('DOMContentLoaded', () => {
    paymentSystem = new PaymentSystem();
    window.paymentSystem = paymentSystem;
});
