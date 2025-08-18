import React, { useState, useEffect } from 'react';
import { Order } from '../../types/order';

interface OrderPrintViewProps {
  order: Order;
  storeSettings?: any;
  onClose: () => void;
}

const OrderPrintView: React.FC<OrderPrintViewProps> = ({ order, storeSettings, onClose }) => {
  const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
  const getPaymentMethodLabel = (method: string) => method === 'money' ? 'Dinheiro' : method === 'pix' ? 'PIX' : method === 'card' ? 'Cartão' : method;
  const getStatusLabel = (status: string) => ({
    pending: 'Pendente', confirmed: 'Confirmado', preparing: 'Em Preparo',
    out_for_delivery: 'Saiu para Entrega', ready_for_pickup: 'Pronto para Retirada',
    delivered: 'Entregue', cancelled: 'Cancelado'
  })[status] || status;

  const handlePrint = () => {
    // Criar uma nova janela com conteúdo específico para impressão térmica
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    if (!printWindow) {
      alert('Por favor, permita pop-ups para imprimir');
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Pedido #${order.id.slice(-8)}</title>
        <style>
          @page {
            size: 80mm auto;
            margin: 0;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            color: black !important;
            background: white !important;
          }
          
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.3;
            color: black;
            background: white;
            padding: 2mm;
            width: 76mm;
          }
          
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .small { font-size: 10px; }
          .separator { 
            border-bottom: 1px dashed black; 
            margin: 5px 0; 
            padding-bottom: 5px; 
          }
          .flex-between { 
            display: flex; 
            justify-content: space-between; 
            align-items: center;
          }
          .mb-1 { margin-bottom: 2px; }
          .mb-2 { margin-bottom: 5px; }
          .mb-3 { margin-bottom: 8px; }
          .mt-1 { margin-top: 2px; }
          .mt-2 { margin-top: 5px; }
          .ml-2 { margin-left: 8px; }
          
          img {
            max-width: 60mm;
            height: auto;
            display: block;
            margin: 5px auto;
          }
        </style>
      </head>
      <body>
        <!-- Cabeçalho -->
        <div class="center mb-3 separator">
          <div class="bold" style="font-size: 16px;">ELITE AÇAÍ</div>
          <div class="small">Delivery Premium</div>
          <div class="small">Rua Um, 1614-C</div>
          <div class="small">Residencial 1 - Cágado</div>
          <div class="small">Tel: (85) 98904-1010</div>
          <div class="small">CNPJ: ${storeSettings?.cnpj || '38.130.139/0001-22'}</div>
        </div>
        
        ${order.payment_method === 'pix' ? `
        <!-- QR Code PIX -->
        <div class="center mb-3 separator">
          <div class="bold mb-2">QR CODE PIX</div>
          <div class="small">Chave PIX: 85989041010</div>
          <div class="small">Nome: Amanda Suyelen da Costa Pereira</div>
          <div class="bold">Valor: ${formatPrice(order.total_price)}</div>
        </div>
        ` : ''}
        
        <!-- Dados do Pedido -->
        <div class="mb-3 separator">
          <div class="bold center mb-2">=== PEDIDO DE DELIVERY ===</div>
          <div class="small">Pedido: #${order.id.slice(-8)}</div>
          <div class="small">Data: ${new Date(order.created_at).toLocaleDateString('pt-BR')}</div>
          <div class="small">Hora: ${new Date(order.created_at).toLocaleTimeString('pt-BR')}</div>
          <div class="small">Status: ${getStatusLabel(order.status)}</div>
        </div>
        
        <!-- Cliente -->
        <div class="mb-3 separator">
          <div class="bold mb-1">DADOS DO CLIENTE:</div>
          <div class="small">Nome: ${order.customer_name}</div>
          <div class="small">Telefone: ${order.customer_phone}</div>
          <div class="small">Endereço: ${order.customer_address}</div>
          <div class="small">Bairro: ${order.customer_neighborhood}</div>
          ${order.customer_complement ? `<div class="small">Complemento: ${order.customer_complement}</div>` : ''}
        </div>
        
        <!-- Itens -->
        <div class="mb-3 separator">
          <div class="bold mb-1">ITENS DO PEDIDO:</div>
          ${order.items.map((item, index) => `
            <div class="mb-2">
              <div class="bold">${item.product_name}</div>
              ${item.selected_size ? `<div class="small">Tamanho: ${item.selected_size}</div>` : ''}
              <div class="flex-between">
                <span class="small">${item.quantity}x ${formatPrice(item.unit_price)}</span>
                <span class="small">${formatPrice(item.total_price)}</span>
              </div>
              ${item.complements && item.complements.length > 0 ? `
                <div class="ml-2 mt-1">
                  <div class="small">Complementos:</div>
                  ${item.complements.map(comp => `
                    <div class="small ml-2">• ${comp.name}${comp.price > 0 ? ` (+${formatPrice(comp.price)})` : ''}</div>
                  `).join('')}
                </div>
              ` : ''}
              ${item.observations ? `<div class="small ml-2 mt-1">Obs: ${item.observations}</div>` : ''}
            </div>
          `).join('')}
        </div>
        
        <!-- Resumo -->
        <div class="mb-3 separator">
          <div class="bold mb-1">RESUMO:</div>
          <div class="flex-between">
            <span class="small">Subtotal:</span>
            <span class="small">${formatPrice(order.total_price - (order.delivery_fee || 0))}</span>
          </div>
          ${order.delivery_fee && order.delivery_fee > 0 ? `
          <div class="flex-between">
            <span class="small">Taxa de Entrega:</span>
            <span class="small">${formatPrice(order.delivery_fee)}</span>
          </div>
          ` : ''}
          <div style="border-top: 1px solid black; padding-top: 3px; margin-top: 3px;">
            <div class="flex-between bold">
              <span>TOTAL:</span>
              <span>${formatPrice(order.total_price)}</span>
            </div>
          </div>
        </div>
        
        <!-- Pagamento -->
        <div class="mb-3 separator">
          <div class="bold mb-1">PAGAMENTO:</div>
          <div class="small">Forma: ${getPaymentMethodLabel(order.payment_method)}</div>
          ${order.change_for ? `<div class="small">Troco para: ${formatPrice(order.change_for)}</div>` : ''}
          ${order.payment_method === 'pix' ? `
          <div class="mt-2">
            <div class="small">⚠️ IMPORTANTE:</div>
            <div class="small">Envie o comprovante do PIX</div>
            <div class="small">para confirmar o pedido!</div>
          </div>
          ` : ''}
        </div>
        
        <!-- Rodapé -->
        <div class="center small" style="border-top: 1px solid black; padding-top: 5px;">
          <div class="bold mb-2">Obrigado pela preferência!</div>
          <div>Elite Açaí - O melhor açaí da cidade!</div>
          <div>@eliteacai</div>
          <div>⭐⭐⭐⭐⭐ Avalie-nos no Google</div>
          <div style="margin-top: 8px; padding-top: 5px; border-top: 1px solid black;">
            <div>Elite Açaí - CNPJ: ${storeSettings?.cnpj || '00.000.000/0001-00'}</div>
            <div>Impresso: ${new Date().toLocaleString('pt-BR')}</div>
            <div>Este não é um documento fiscal</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Aguardar carregar e imprimir
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  return (
    <>
      {/* Modal Interface - Hidden on print */}
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 print:hidden">
        <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-hidden">
          {/* Controls */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Imprimir Pedido</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Gerar mensagem do pedido para WhatsApp da loja
                    let message = `🆕 *NOVO PEDIDO RECEBIDO - ELITE AÇAÍ*\n\n`;
                    message += `📋 *Pedido #${order.id.slice(-8)}*\n`;
                    message += `🕐 Recebido: ${new Date(order.created_at).toLocaleString('pt-BR')}\n`;
                    message += `📊 Status: ${getStatusLabel(order.status)}\n\n`;
                    
                    message += `👤 *CLIENTE:*\n`;
                    message += `Nome: ${order.customer_name}\n`;
                    message += `📱 Telefone: ${order.customer_phone}\n`;
                    message += `📍 Endereço: ${order.customer_address}\n`;
                    message += `🏘️ Bairro: ${order.customer_neighborhood}\n`;
                    if (order.customer_complement) {
                      message += `🏠 Complemento: ${order.customer_complement}\n`;
                    }
                    
                    // Adicionar link do Google Maps para localização
                    const fullAddress = `${order.customer_address}, ${order.customer_neighborhood}`;
                    const encodedAddress = encodeURIComponent(fullAddress);
                    message += `📍 *LOCALIZAÇÃO:*\n`;
                    message += `https://www.google.com/maps/search/?api=1&query=${encodedAddress}\n`;
                    message += `\n`;
                    
                    message += `🛒 *ITENS DO PEDIDO:*\n`;
                    order.items.forEach((item, index) => {
                      message += `${index + 1}. ${item.product_name}\n`;
                      if (item.selected_size) {
                        message += `   Tamanho: ${item.selected_size}\n`;
                      }
                      message += `   Qtd: ${item.quantity}x - ${formatPrice(item.total_price)}\n`;
                      
                      if (item.complements && item.complements.length > 0) {
                        message += `   *Complementos:*\n`;
                        item.complements.forEach(comp => {
                          message += `   • ${comp.name}`;
                          if (comp.price > 0) {
                            message += ` (+${formatPrice(comp.price)})`;
                          }
                          message += `\n`;
                        });
                      }
                      
                      if (item.observations) {
                        message += `   *Obs:* ${item.observations}\n`;
                      }
                      message += `\n`;
                    });
                    
                    message += `💰 *VALORES:*\n`;
                    const subtotal = order.total_price - (order.delivery_fee || 0);
                    message += `Subtotal: ${formatPrice(subtotal)}\n`;
                    if (order.delivery_fee && order.delivery_fee > 0) {
                      message += `Taxa de entrega: ${formatPrice(order.delivery_fee)}\n`;
                    }
                    message += `*TOTAL: ${formatPrice(order.total_price)}*\n\n`;
                    
                    message += `💳 *PAGAMENTO:*\n`;
                    message += `Forma: ${getPaymentMethodLabel(order.payment_method)}\n`;
                    if (order.change_for) {
                      message += `Troco para: ${formatPrice(order.change_for)}\n`;
                    }
                    if (order.payment_method === 'pix') {
                      message += `\n📱 *DADOS PIX:*\n`;
                      message += `Chave: 85989041010\n`;
                      message += `Nome: Grupo Elite\n`;
                      message += `Valor: ${formatPrice(order.total_price)}\n`;
                    }
                    message += `\n`;
                    
                    message += `⚠️ *AÇÃO NECESSÁRIA:*\n`;
                    message += `• Confirmar recebimento do pedido\n`;
                    message += `• Iniciar preparo dos itens\n`;
                    if (order.payment_method === 'pix') {
                      message += `• Aguardar comprovante do PIX\n`;
                    }
                    message += `\n`;
                    
                    message += `📱 Sistema de Atendimento - Elite Açaí`;
                    
                    // Abrir WhatsApp da loja
                    window.open(`https://wa.me/5585989041010?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                  title="Enviar pedido para WhatsApp da loja"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                  </svg>
                  WhatsApp Loja
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2"
                >
                  🖨️ Imprimir
                </button>
                <button
                  onClick={onClose}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm">
              <div className="text-center mb-4">
                <p className="font-bold text-lg">ELITE AÇAÍ</p>
                <p className="text-sm">Delivery Premium</p>
                <p className="text-xs">Rua Um, 1614-C</p>
                <p className="text-xs">Residencial 1 - Cágado</p>
                <p className="text-xs">Tel: (85) 98904-1010</p>
                <p className="text-xs">CNPJ: {storeSettings?.cnpj || '38.130.139/0001-22'}</p>
                <p className="text-xs">--------------------------</p>
              </div>
              
              {/* QR Code PIX - apenas para pagamentos PIX */}
              {order.payment_method === 'pix' && (
                <div className="text-center mb-4 pb-2 border-b border-dashed border-gray-400">
                  <div className="font-bold mb-2">QR CODE PIX</div>
                  <div className="space-y-1">
                    <div>Chave PIX: 85989041010</div>
                    <div>Nome: Amanda Suyelen da Costa Pereira</div>
                    <div className="font-bold">Valor: {formatPrice(order.total_price)}</div>
                  </div>
                  <p>--------------------------</p>
                </div>
              )}
              
              <div className="mb-3">
                <p className="text-xs">Pedido: #{order.id.slice(-8)}</p>
                <p className="text-xs">Data: {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
                <p className="text-xs">Hora: {new Date(order.created_at).toLocaleTimeString('pt-BR')}</p>
                <p className="text-xs">Status: {getStatusLabel(order.status)}</p>
                <p className="text-xs">--------------------------</p>
              </div>
              
              <div className="mb-3">
                <p className="text-xs font-bold">CLIENTE:</p>
                <p className="text-xs">Nome: {order.customer_name}</p>
                <p className="text-xs">Telefone: {order.customer_phone}</p>
                <p className="text-xs">Endereço: {order.customer_address}</p>
                <p className="text-xs">Bairro: {order.customer_neighborhood}</p>
                {order.customer_complement && <p className="text-xs">Complemento: {order.customer_complement}</p>}
                <p className="text-xs">--------------------------</p>
              </div>
              
              <div className="mb-3">
                <p className="text-xs font-bold">ITENS:</p>
                {order.items.map((item, index) => (
                  <div key={index} className="text-xs mb-2">
                    <p>{item.product_name}</p>
                    {item.selected_size && <p>Tamanho: {item.selected_size}</p>}
                    <p>{item.quantity}x {formatPrice(item.unit_price)} = {formatPrice(item.total_price)}</p>
                    
                    {item.complements && item.complements.length > 0 && (
                      <div className="ml-2 mt-1">
                        <p>Complementos:</p>
                        {item.complements.map((comp, idx) => (
                          <p key={idx} className="ml-2">• {comp.name}{comp.price > 0 && ` (+${formatPrice(comp.price)})`}</p>
                        ))}
                      </div>
                    )}
                    
                    {item.observations && <p>Obs: {item.observations}</p>}
                  </div>
                ))}
                <p className="text-xs">--------------------------</p>
              </div>
              
              <div className="mb-3">
                <p className="text-xs">Subtotal: {formatPrice(order.total_price - (order.delivery_fee || 0))}</p>
                {order.delivery_fee && order.delivery_fee > 0 && <p className="text-xs">Taxa: {formatPrice(order.delivery_fee)}</p>}
                <p className="text-xs font-bold">TOTAL: {formatPrice(order.total_price)}</p>
                <p className="text-xs">--------------------------</p>
              </div>
              
              <div className="mb-3">
                <p className="text-xs font-bold">PAGAMENTO:</p>
                <p className="text-xs">Forma: {getPaymentMethodLabel(order.payment_method)}</p>
                {order.change_for && <p className="text-xs">Troco para: {formatPrice(order.change_for)}</p>}
                {order.payment_method === 'pix' && (
                  <div className="mt-2">
                    <p className="text-xs">⚠️ IMPORTANTE:</p>
                    <p className="text-xs">Envie o comprovante do PIX</p>
                    <p className="text-xs">para confirmar o pedido!</p>
                  </div>
                )}
                <p className="text-xs">--------------------------</p>
              </div>
              
              <div className="text-center text-xs">
                <p>Obrigado pela preferência!</p>
                <p>Elite Açaí</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Content - Only visible when printing */}
      <div className="hidden print:block print:w-full print:h-full print:bg-white print:text-black thermal-print-content">
        <div style={{ fontFamily: 'Courier New, monospace', fontSize: '14px', lineHeight: '1.4', color: 'black', background: 'white', padding: '10mm' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '1px dashed black', paddingBottom: '10px', color: 'black', background: 'white' }}>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 5px 0' }}>ELITE AÇAÍ</h1>
            <p style={{ fontSize: '12px', margin: '2px 0' }}>Delivery Premium</p>
            <p style={{ fontSize: '10px', margin: '2px 0' }}>Rua Dois, 2130-A</p>
            <p style={{ fontSize: '10px', margin: '2px 0' }}>Residencial 1 - Cágado</p>
            <p style={{ fontSize: '10px', margin: '2px 0' }}>Tel: (85) 98904-1010</p>
            <p style={{ fontSize: '10px', margin: '2px 0' }}>CNPJ: {storeSettings?.cnpj || '38.130.139/0001-22'}</p>
          </div>

          {/* QR Code PIX */}
          {order.payment_method === 'pix' && (
            <div style={{ textAlign: 'center', marginBottom: '15px', borderBottom: '1px dashed black', paddingBottom: '10px', color: 'black', background: 'white' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>QR CODE PIX</p>
              <p style={{ fontSize: '10px', margin: '5px 0' }}>Chave PIX: 85989041010</p>
              <p style={{ fontSize: '10px', margin: '5px 0' }}>Nome: Grupo Elite</p>
              <p style={{ fontSize: '12px', fontWeight: 'bold', margin: '5px 0' }}>Valor: {formatPrice(order.total_price)}</p>
            </div>
          )}

          {/* Order Info */}
          <div style={{ marginBottom: '15px', color: 'black', background: 'white' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', textAlign: 'center', marginBottom: '10px' }}>=== PEDIDO DE DELIVERY ===</p>
            <p style={{ fontSize: '10px', margin: '2px 0' }}>Pedido: #{order.id.slice(-8)}</p>
            <p style={{ fontSize: '10px', margin: '2px 0' }}>Data: {new Date(order.created_at).toLocaleDateString('pt-BR')}</p>
            <p style={{ fontSize: '10px', margin: '2px 0' }}>Hora: {new Date(order.created_at).toLocaleTimeString('pt-BR')}</p>
            <p style={{ fontSize: '10px', margin: '2px 0' }}>Status: {getStatusLabel(order.status)}</p>
          </div>

          {/* Customer Info */}
          <div style={{ borderBottom: '1px dashed black', paddingBottom: '10px', marginBottom: '15px', color: 'black', background: 'white' }}>
            <p style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' }}>DADOS DO CLIENTE:</p>
            <p style={{ fontSize: '10px', margin: '2px 0' }}>Nome: {order.customer_name}</p>
            <p style={{ fontSize: '10px', margin: '2px 0' }}>Telefone: {order.customer_phone}</p>
            <p style={{ fontSize: '10px', margin: '2px 0' }}>Endereço: {order.customer_address}</p>
            <p style={{ fontSize: '10px', margin: '2px 0' }}>Bairro: {order.customer_neighborhood}</p>
            {order.customer_complement && <p style={{ fontSize: '10px', margin: '2px 0' }}>Complemento: {order.customer_complement}</p>}
          </div>

          {/* Items */}
          <div style={{ borderBottom: '1px dashed black', paddingBottom: '10px', marginBottom: '15px', color: 'black', background: 'white' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>ITENS DO PEDIDO:</p>
            {order.items.map((item, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '14px', fontWeight: 'bold', margin: '2px 0' }}>{item.product_name}</p>
                {item.selected_size && <p style={{ fontSize: '12px', margin: '2px 0' }}>Tamanho: {item.selected_size}</p>}
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px' }}>{item.quantity}x {formatPrice(item.unit_price)}</span>
                  <span style={{ fontSize: '12px' }}>{formatPrice(item.total_price)}</span>
                </div>
                
                {item.complements && item.complements.length > 0 && (
                  <div style={{ marginLeft: '8px', marginTop: '5px' }}>
                    <p style={{ fontSize: '12px' }}>Complementos:</p>
                    {item.complements.map((comp, idx) => (
                      <p key={idx} style={{ fontSize: '12px', marginLeft: '8px' }}>• {comp.name}{comp.price > 0 && ` (+${formatPrice(comp.price)})`}</p>
                    ))}
                  </div>
                )}
                
                {item.observations && <p style={{ fontSize: '12px', marginLeft: '8px', marginTop: '5px' }}>Obs: {item.observations}</p>}
              </div>
            ))}
          </div>

          {/* Summary */}
          <div style={{ borderBottom: '1px dashed black', paddingBottom: '10px', marginBottom: '15px', color: 'black', background: 'white' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>RESUMO:</p>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '12px' }}>Subtotal:</span>
              <span style={{ fontSize: '12px' }}>{formatPrice(order.total_price - (order.delivery_fee || 0))}</span>
            </div>
            {order.delivery_fee && order.delivery_fee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px' }}>Taxa de Entrega:</span>
                <span style={{ fontSize: '12px' }}>{formatPrice(order.delivery_fee)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderTop: '1px solid black', paddingTop: '5px', marginTop: '5px' }}>
              <span style={{ fontSize: '14px' }}>TOTAL:</span>
              <span style={{ fontSize: '14px' }}>{formatPrice(order.total_price)}</span>
            </div>
          </div>

          {/* Payment */}
          <div style={{ borderBottom: '1px dashed black', paddingBottom: '10px', marginBottom: '15px', color: 'black', background: 'white' }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>PAGAMENTO:</p>
            <p style={{ fontSize: '12px', margin: '2px 0' }}>Forma: {getPaymentMethodLabel(order.payment_method)}</p>
            {order.change_for && <p style={{ fontSize: '12px', margin: '2px 0' }}>Troco para: {formatPrice(order.change_for)}</p>}
            {order.payment_method === 'pix' && (
              <div style={{ marginTop: '5px' }}>
                <p style={{ fontSize: '12px', margin: '2px 0' }}>⚠️ IMPORTANTE:</p>
                <p style={{ fontSize: '12px', margin: '2px 0' }}>Envie o comprovante do PIX</p>
                <p style={{ fontSize: '12px', margin: '2px 0' }}>para confirmar o pedido!</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: '12px', borderTop: '1px solid black', paddingTop: '10px', color: 'black', background: 'white' }}>
            <p style={{ fontWeight: 'bold', marginBottom: '10px' }}>Obrigado pela preferência!</p>
            <p style={{ margin: '2px 0' }}>Elite Açaí - O melhor açaí da cidade!</p>
            <p style={{ margin: '2px 0' }}>@eliteacai</p>
            <p style={{ margin: '2px 0' }}>⭐⭐⭐⭐⭐ Avalie-nos no Google</p>
            <div style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px solid black' }}>
              <p style={{ margin: '2px 0' }}>Elite Açaí - CNPJ: {storeSettings?.cnpj || '38.130.139/0001-22'}</p>
              <p style={{ margin: '2px 0' }}>Impresso: {new Date().toLocaleString('pt-BR')}</p>
              <p style={{ margin: '2px 0' }}>Este não é um documento fiscal</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0 !important;
          }
          
          html, body {
            font-family: 'Courier New', monospace !important;
            font-size: 12px !important;
            line-height: 1.4 !important;
            color: black !important;
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          * {
            color: black !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            box-sizing: border-box !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          .print\\:block {
            display: block !important;
            visibility: visible !important;
          }
          
          .print\\:w-full {
            width: 100% !important;
          }
          
          .print\\:h-full {
            height: 100% !important;
          }
          
          .print\\:bg-white {
            background: white !important;
          }
          
          .print\\:text-black {
            color: black !important;
          }
          
          /* Force visibility for thermal printing */
          .thermal-print-content {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
            font-family: 'Courier New', monospace !important;
            font-size: 12px !important;
            line-height: 1.3 !important;
            color: black !important;
            background: white !important;
            padding: 2mm !important;
            margin: 0 !important;
          }
          
          /* Remove all transforms and effects */
          .thermal-print-content * {
            transform: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            opacity: 1 !important;
            visibility: visible !important;
          }
          
          /* Ensure text is visible */
          .thermal-print-content p,
          .thermal-print-content div,
          .thermal-print-content span {
            color: black !important;
            background: white !important;
            display: block !important;
            visibility: visible !important;
          }
          
          /* Images for thermal printing */
          .thermal-print-content img {
            max-width: 60mm !important;
            height: auto !important;
            display: block !important;
            margin: 5mm auto !important;
          }
        }
      `}</style>
    </>
  );
};

export default OrderPrintView;